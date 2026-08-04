import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { NotificationDetailPage } from "~/features/notifications/pages/NotificationDetailPage";

afterEach(cleanup);

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

const notification = {
  id: 10,
  title: "集合場所変更",
  body: "集合場所は体育館です。",
  audienceName: "配信対象者（30名）",
  recipientCount: 30,
  scheduledAt: "2026-11-07T09:00:00+09:00",
  creatorName: "HAL 太郎",
  relatedEventId: null,
  relatedEventName: "大縄跳び",
  status: "draft" as const,
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

function createApi(): NotificationManagementApi {
  return {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(notification),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("NotificationDetailPage", () => {
  it("通知内容と編集導線を表示する", async () => {
    const api = createApi();

    render(
      <MemoryRouter>
        <NotificationDetailPage api={api} notificationId={10} />
      </MemoryRouter>
    );

    expect(await screen.findByText("集合場所変更")).toBeInTheDocument();
    expect(screen.getByText("集合場所は体育館です。")).toBeInTheDocument();
    expect(screen.getByText("未送信")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "通知を編集" })).toHaveAttribute(
      "href",
      "/notifications/10/edit"
    );
    expect(api.getById).toHaveBeenCalledWith(10);
  });

  it("不正なIDではAPIを呼ばず一覧への戻り導線を表示する", async () => {
    const api = createApi();

    render(
      <MemoryRouter>
        <NotificationDetailPage api={api} notificationId={0} />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("対象の通知が見つかりません。")
    ).toBeInTheDocument();
    expect(api.getById).not.toHaveBeenCalled();
    expect(
      screen.getAllByRole("link", { name: "通知一覧へ戻る" }).length
    ).toBeGreaterThan(0);
  });
});
