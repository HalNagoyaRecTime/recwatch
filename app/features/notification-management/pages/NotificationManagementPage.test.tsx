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
