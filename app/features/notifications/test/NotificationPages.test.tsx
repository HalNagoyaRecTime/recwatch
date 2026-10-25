import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { httpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";
import { httpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { httpNotificationConfigApi } from "~/features/notifications/api/http/notification-config-api";
import { ApiClientError } from "~/lib/api-client-error";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";
import { notificationConfigFixture } from "~/features/notifications/mock/notification-fixtures";
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

vi.setConfig({ testTimeout: 15_000 });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

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
  it("MarkdownプレビューにはPushではなく詳細本文を表示する", async () => {
    render(
      <MemoryRouter>
        <NotificationCreatePage
          api={createCommandApi()}
          audienceApi={{ load: vi.fn().mockResolvedValue([]) }}
          configApi={mockNotificationConfigApi}
        />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("本文*"), {
      target: { value: "# Push本文" },
    });
    fireEvent.change(
      await screen.findByLabelText("Markdownソース", {}, { timeout: 10_000 }),
      {
        target: { value: "# 詳細本文" },
      }
    );
    expect(
      screen.getByRole("heading", { name: "詳細本文" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Push本文" })
    ).not.toBeInTheDocument();
  });

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
    fireEvent.change(
      await screen.findByLabelText("Markdownソース", {}, { timeout: 10_000 }),
      {
        target: { value: "集合場所も確認してください。" },
      }
    );
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
  it("HTTP adapterと共通apiClientでユーザー候補取得から作成まで送信する", async () => {
    const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      const path = new URL(input).pathname;
      let body: unknown;
      if (path === "/api/v1/students")
        body = {
          items: [{ student_id: 7, user_id: 901, display_name: "テスト学生" }],
          total: 1,
          limit: 100,
          offset: 0,
        };
      else if (path === "/api/v1/teachers" || path === "/api/v1/classrooms")
        body = { items: [], total: 0, limit: 100, offset: 0 };
      else if (path === "/api/v1/events")
        body = { events: [], total: 0, limit: 100, offset: 0 };
      else if (path.endsWith("/config")) body = notificationConfigFixture;
      else if (path.endsWith("/audience-count")) body = { recipientCount: 1 };
      else if (
        path === "/api/v1/admin/notifications" &&
        init?.method === "POST"
      )
        body = { notificationId: 108, notificationScheduleId: 508 };
      else throw new Error(`想定外の取得先: ${path}`);
      return new Response(JSON.stringify(body), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotificationCreatePage
          api={httpAdminNotificationCommandApi}
          audienceApi={httpNotificationAudienceApi}
          configApi={httpNotificationConfigApi}
        />
      </MemoryRouter>
    );
    await user.click(screen.getByRole("button", { name: "ユーザー" }));
    const search = screen.getByRole("combobox", {
      name: "ユーザーを検索して追加",
    });
    await waitFor(() => expect(search).toBeEnabled());
    await user.type(search, "テスト学生");
    await user.click(await screen.findByRole("option", { name: /テスト学生/ }));
    for (const label of ["タイトル*", "本文*", "詳細タイトル*", "詳細本文*"])
      fireEvent.change(
        await screen.findByLabelText(
          label === "詳細本文*" ? "Markdownソース" : label,
          {},
          { timeout: 10_000 }
        ),
        {
          target: { value: "テスト通知" },
        }
      );
    const button = screen.getByRole("button", { name: "通知を配信" });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(
          ([url, init]) =>
            new URL(url).pathname === "/api/v1/admin/notifications" &&
            init?.method === "POST"
        )
      ).toHaveLength(1)
    );
    const request = fetchMock.mock.calls.find(
      ([url, init]) =>
        new URL(url).pathname === "/api/v1/admin/notifications" &&
        init?.method === "POST"
    );
    expect(JSON.parse(String(request?.[1]?.body)).audience).toEqual({
      items: [{ type: "user", targetId: 901 }],
    });
  });

  it("追加済みの対象は検索候補に再表示しない", async () => {
    const user = userEvent.setup();
    const api = createCommandApi();
    const reportFeedback = vi.fn();
    render(
      <MemoryRouter>
        <NotificationCreatePage
          api={api}
          audienceApi={{
            load: vi.fn().mockResolvedValue(mockNotificationAudienceOptions),
          }}
          configApi={mockNotificationConfigApi}
          reportFeedback={reportFeedback}
        />
      </MemoryRouter>
    );
    for (const label of ["タイトル*", "本文*", "詳細タイトル*", "詳細本文*"])
      fireEvent.change(
        await screen.findByLabelText(
          label === "詳細本文*" ? "Markdownソース" : label,
          {},
          { timeout: 10_000 }
        ),
        {
          target: { value: "テスト" },
        }
      );
    await user.click(screen.getByRole("button", { name: "クラス" }));
    const search = screen.getByRole("combobox", {
      name: "クラスを検索して追加",
    });
    await waitFor(() => expect(search).toBeEnabled());
    await user.type(search, "1年A組");
    await user.click(await screen.findByRole("option", { name: /1年A組/ }));
    await user.type(search, "1年A組");
    expect(
      screen.queryByRole("option", { name: /1年A組/ })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("一致する通知対象がありません")
    ).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
    expect(reportFeedback).not.toHaveBeenCalled();
  });

  it("実APIのcontentとimportanceの400をフォーム内に表示する", async () => {
    const api = createCommandApi({
      create: vi.fn().mockRejectedValue(
        new ApiClientError(400, "入力エラー", "VALIDATION_ERROR", {
          fieldErrors: {
            content: ["通知内容を確認してください"],
            importance: ["この重要度は選べません"],
          },
          formErrors: [],
        })
      ),
    });
    const reportFeedback = vi.fn();
    render(
      <MemoryRouter>
        <NotificationCreatePage
          api={api}
          audienceApi={{ load: vi.fn().mockResolvedValue([]) }}
          configApi={mockNotificationConfigApi}
          reportFeedback={reportFeedback}
        />
      </MemoryRouter>
    );
    for (const label of ["タイトル*", "本文*", "詳細タイトル*", "詳細本文*"])
      fireEvent.change(
        await screen.findByLabelText(
          label === "詳細本文*" ? "Markdownソース" : label,
          {},
          { timeout: 10_000 }
        ),
        {
          target: { value: "テスト" },
        }
      );
    const button = screen.getByRole("button", { name: "通知を配信" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    expect(
      await screen.findByText("この重要度は選べません")
    ).toBeInTheDocument();
    expect(
      screen.getByText("通知内容: 通知内容を確認してください")
    ).toBeInTheDocument();
    expect(reportFeedback).not.toHaveBeenCalled();
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
