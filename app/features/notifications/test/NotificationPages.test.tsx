import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import { mockNotificationConfigApi } from "~/features/notifications/mock/notification-config-api";
import { NotificationEditPage } from "~/features/notifications/pages/NotificationEditPage";
import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
} from "~/features/notifications/mock/notification-fixtures";

afterEach(cleanup);

function createCommandApi(
  overrides: Partial<AdminNotificationCommandApi> = {}
): AdminNotificationCommandApi {
  return {
    create: vi.fn().mockResolvedValue({
      notificationId: 108,
      notificationScheduleId: 508,
    }),
    patch: vi.fn().mockResolvedValue(adminNotificationDetailFixture),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("notification pages", () => {
  it("v2一覧Responseを表示する", async () => {
    const queryApi: AdminNotificationQueryApi = {
      list: vi.fn().mockResolvedValue(adminNotificationListFixture),
      getDetail: vi.fn().mockResolvedValue(adminNotificationDetailFixture),
    };

    render(
      <MemoryRouter>
        <NotificationListPage
          commandApi={createCommandApi()}
          queryApi={queryApi}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText("通知101")).toBeInTheDocument();
    expect(screen.getByText("配信予定")).toBeInTheDocument();
    expect(screen.getAllByText("削除済み").length).toBeGreaterThan(0);
  });

  it("作成Formをv2 Requestへ変換して送信する", async () => {
    const create = vi.fn().mockResolvedValue({
      notificationId: 108,
      notificationScheduleId: 508,
    });
    const audienceApi: NotificationAudienceApi = {
      load: vi.fn().mockResolvedValue([]),
    };

    render(
      <MemoryRouter>
        <NotificationCreatePage
          api={createCommandApi({ create })}
          audienceApi={audienceApi}
          configApi={mockNotificationConfigApi}
        />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("タイトル*"), {
      target: { value: "緊急連絡" },
    });
    fireEvent.change(screen.getByLabelText("本文*"), {
      target: { value: "集合時刻を変更します。" },
    });
    fireEvent.change(screen.getByLabelText("詳細タイトル*"), {
      target: { value: "緊急連絡の詳細" },
    });
    fireEvent.change(screen.getByLabelText("詳細本文*"), {
      target: { value: "集合場所も確認してください。" },
    });
    const submitButton = screen.getByRole("button", { name: "通知を配信" });
    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledWith({
      content: {
        push: { title: "緊急連絡", body: "集合時刻を変更します。" },
        detail: {
          title: "緊急連絡の詳細",
          body: "集合場所も確認してください。",
        },
      },
      audience: { items: [{ type: "all" }] },
      delivery: { type: "immediate", sendAt: null },
      importance: "normal",
    });
  });
  it("開始済み通知はconfigやAudience取得失敗でも詳細を保存できる", async () => {
    const notification = {
      ...adminNotificationDetailFixture,
      schedules: adminNotificationDetailFixture.schedules.map((schedule) => ({
        ...schedule,
        status: "sending" as const,
        sendAt: "2020-01-01T00:00:00Z",
      })),
    };
    const patch = vi.fn().mockResolvedValue(notification);
    render(
      <MemoryRouter>
        <NotificationEditPage
          notificationId={notification.notificationId}
          commandApi={createCommandApi({ patch })}
          queryApi={{
            list: vi.fn(),
            getDetail: vi.fn().mockResolvedValue(notification),
          }}
          audienceApi={{
            load: vi.fn().mockRejectedValue(new Error("候補取得失敗")),
          }}
          configApi={{
            getConfig: vi.fn().mockRejectedValue(new Error("config取得失敗")),
            getAudienceCount: vi.fn(),
          }}
        />
      </MemoryRouter>
    );
    const input = await screen.findByLabelText("詳細タイトル*");
    fireEvent.change(input, { target: { value: "変更する詳細" } });
    const save = screen.getByRole("button", { name: "変更を保存" });
    expect(save).toBeEnabled();
    expect(screen.getByLabelText("タイトル*")).toBeDisabled();
    fireEvent.click(save);
    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith(
        notification.notificationId,
        expect.objectContaining({
          content: {
            detail: {
              title: "変更する詳細",
              body: notification.content.detail.body,
            },
          },
        })
      )
    );
  });
});
