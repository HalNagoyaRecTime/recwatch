import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminNotificationManagementGateway } from "../application/admin-notification-management-gateway";
import { NotificationManagementError } from "../application/notification-management-error";
import type { ManagedNotification } from "../model/managed-notification";
import { NotificationManagementPage } from "./NotificationManagementPage";

afterEach(cleanup);

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
      limit: 50,
      offset: 0,
    }),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("NotificationManagementPage", () => {
  it("50件を超える通知を追加で読み込む", async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({
      ...draftNotification,
      id: index + 1,
      title: `通知${index + 1}`,
    }));
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: firstPage,
        total: 51,
        limit: 50,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [
          {
            ...draftNotification,
            id: 51,
            title: "通知51",
          },
        ],
        total: 51,
        limit: 50,
        offset: 50,
      });
    const user = userEvent.setup();

    render(<NotificationManagementPage gateway={createGateway({ list })} />);

    await user.click(
      await screen.findByRole("button", { name: "さらに読み込む" })
    );

    expect(await screen.findByText("通知51")).toBeInTheDocument();
    expect(list).toHaveBeenNthCalledWith(1, { limit: 50, offset: 0 });
    expect(list).toHaveBeenNthCalledWith(2, { limit: 50, offset: 50 });
    expect(
      screen.queryByRole("button", { name: "さらに読み込む" })
    ).not.toBeInTheDocument();
  });

  it.each([
    ["authentication_required", "ログインが必要です。"],
    ["forbidden", "通知を管理する権限がありません。"],
  ] as const)("一覧取得時の%sエラーを表示する", async (kind, message) => {
    render(
      <NotificationManagementPage
        gateway={createGateway({
          list: vi
            .fn()
            .mockRejectedValue(new NotificationManagementError(kind)),
        })}
      />
    );

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it("追加読込が完了するまで削除操作を無効にする", async () => {
    let resolveNextPage!: (value: {
      notifications: ManagedNotification[];
      total: number;
      limit: number;
      offset: number;
    }) => void;
    const nextPage = new Promise<{
      notifications: ManagedNotification[];
      total: number;
      limit: number;
      offset: number;
    }>((resolve) => {
      resolveNextPage = resolve;
    });
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: [draftNotification],
        total: 2,
        limit: 50,
        offset: 0,
      })
      .mockReturnValueOnce(nextPage);
    const user = userEvent.setup();

    render(<NotificationManagementPage gateway={createGateway({ list })} />);

    await user.click(
      await screen.findByRole("button", { name: "さらに読み込む" })
    );

    const deleteButton = screen.getByRole("button", {
      name: "「集合場所変更」を削除",
    });
    expect(deleteButton).toBeDisabled();

    resolveNextPage({
      notifications: [{ ...draftNotification, id: 11, title: "通知11" }],
      total: 2,
      limit: 50,
      offset: 1,
    });

    expect(await screen.findByText("通知11")).toBeInTheDocument();
    expect(deleteButton).toBeEnabled();
  });

  it("削除成功後に対象の通知を一覧から除外する", async () => {
    const deleteNotification = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <NotificationManagementPage
        gateway={createGateway({ delete: deleteNotification })}
      />
    );

    await user.click(
      await screen.findByRole("button", {
        name: "「集合場所変更」を削除",
      })
    );
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
        limit: 50,
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
        limit: 50,
        offset: 0,
      });
    const user = userEvent.setup();

    render(
      <NotificationManagementPage
        gateway={createGateway({
          list,
          delete: vi
            .fn()
            .mockRejectedValue(new NotificationManagementError("conflict")),
        })}
      />
    );

    await user.click(
      await screen.findByRole("button", {
        name: "「集合場所変更」を削除",
      })
    );
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText(
        "通知の配信状態が変更されました。一覧を再読み込みして確認してください。"
      )
    ).toBeInTheDocument();
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(screen.getByText("送信中")).toBeInTheDocument();
  });
});
