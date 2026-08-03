import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminNotificationManagementGateway } from "~/features/notifications/application/admin-notification-management-gateway";
import { NotificationManagementError } from "~/features/notifications/application/notification-management-error";
import type { ManagedNotification } from "~/features/notifications/model/managed-notification";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";

afterEach(cleanup);

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function renderPage(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const draftNotification: ManagedNotification = {
  id: 10,
  title: "集合場所変更",
  body: "集合場所は体育館です。",
  audienceName: "配信対象者（30名）",
  recipientCount: 30,
  scheduledAt: "2026-11-07T09:00:00+09:00",
  creatorName: "HAL 太郎",
  relatedEventId: null,
  relatedEventName: null,
  status: "draft",
  deliverySummary: {
    total: 30,
    draft: 30,
    sending: 0,
    sent: 0,
    failed: 0,
  },
  createdAt: "2026-11-07T08:00:00+09:00",
  updatedAt: "2026-11-07T08:00:00+09:00",
};

function createGateway(
  overrides: Partial<AdminNotificationManagementGateway> = {}
): AdminNotificationManagementGateway {
  return {
    list: vi.fn().mockResolvedValue({
      notifications: [draftNotification],
      total: 1,
      limit: 20,
      offset: 0,
    }),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

async function openDeleteMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("button", {
      name: "集合場所変更のその他の操作",
    })
  );
  await user.click(screen.getByRole("button", { name: "通知を削除" }));
}

describe("NotificationListPage", () => {
  it("ページ移動時にmake-pageのページサイズで次の一覧を取得する", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) => ({
      ...draftNotification,
      id: index + 1,
      title: `通知${index + 1}`,
    }));
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: firstPage,
        total: 21,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [{ ...draftNotification, id: 21, title: "通知21" }],
        total: 21,
        limit: 20,
        offset: 20,
      });
    const user = userEvent.setup();

    renderPage(<NotificationListPage gateway={createGateway({ list })} />);

    await user.click(await screen.findByRole("button", { name: "次のページ" }));

    expect(await screen.findByText("通知21")).toBeInTheDocument();
    expect(list).toHaveBeenNthCalledWith(1, { limit: 20, offset: 0 });
    expect(list).toHaveBeenNthCalledWith(2, { limit: 20, offset: 20 });
  });

  it.each([
    ["authentication_required", "ログインが必要です。"],
    ["forbidden", "通知を管理する権限がありません。"],
  ] as const)(
    "一覧取得時の%sエラーはアクセシブルに通知する",
    async (kind, message) => {
      renderPage(
        <NotificationListPage
          gateway={createGateway({
            list: vi
              .fn()
              .mockRejectedValue(new NotificationManagementError(kind)),
          })}
        />
      );

      expect(
        await screen.findByText(message, { selector: "div" })
      ).toBeInTheDocument();
    }
  );

  it("削除成功後に対象の通知を一覧から除外する", async () => {
    const deleteNotification = vi.fn().mockResolvedValue(undefined);
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: [draftNotification],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [],
        total: 0,
        limit: 20,
        offset: 0,
      });
    const user = userEvent.setup();

    renderPage(
      <NotificationListPage
        gateway={createGateway({ delete: deleteNotification, list })}
      />
    );

    await openDeleteMenu(user);
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => expect(deleteNotification).toHaveBeenCalledWith(10));
    expect(screen.queryByText("集合場所変更")).not.toBeInTheDocument();
  });

  it("409競合時に一覧を再取得してメッセージを表示する", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: [draftNotification],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [
          {
            ...draftNotification,
            status: "sending",
            deliverySummary: {
              total: 30,
              draft: 0,
              sending: 30,
              sent: 0,
              failed: 0,
            },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      });
    const user = userEvent.setup();

    renderPage(
      <NotificationListPage
        gateway={createGateway({
          list,
          delete: vi
            .fn()
            .mockRejectedValue(new NotificationManagementError("conflict")),
        })}
      />
    );

    await openDeleteMenu(user);
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText(
        "通知の配信状態が変更されました。一覧を再読み込みして確認してください。",
        { selector: "div" }
      )
    ).toBeInTheDocument();
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText("送信中").length).toBeGreaterThanOrEqual(1);
  });
});
