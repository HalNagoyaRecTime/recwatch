import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";
import type { ManagedNotification } from "~/features/notifications/model/notification";
import { NotificationEditPage } from "~/features/notifications/pages/NotificationEditPage";

afterEach(cleanup);

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

const draftNotification: ManagedNotification = {
  id: 101,
  title: "競技開始時間の変更",
  body: "開始時間を変更します。",
  audienceName: "競技参加者（30名）",
  audience: { type: "event_participants", eventId: 2 },
  recipientCount: 30,
  scheduledAt: "2026-11-07T09:00:00+09:00",
  creatorName: "HAL 太郎",
  relatedEventId: 2,
  relatedEventName: "走れ！〇人〇脚！",
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
  overrides: Partial<NotificationManagementApi> = {}
): NotificationManagementApi {
  return {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(draftNotification),
    update: vi.fn().mockResolvedValue(draftNotification),
    delete: vi.fn(),
    ...overrides,
  };
}

function createAudienceLoader(
  load = vi.fn().mockResolvedValue(mockNotificationAudienceOptions)
): NotificationAudienceApi {
  return { load };
}

describe("NotificationEditPage", () => {
  it("既存通知を読み込み、編集内容を更新する", async () => {
    const update = vi.fn().mockResolvedValue(draftNotification);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationEditPage
          api={createGateway({ update })}
          audienceApi={createAudienceLoader()}
          notificationId={101}
        />
      </MemoryRouter>
    );

    const title = await screen.findByLabelText("タイトル*");
    expect(title).toHaveValue("競技開始時間の変更");
    expect(screen.getByLabelText("本文*")).toHaveValue(
      "開始時間を変更します。"
    );

    await user.clear(title);
    await user.type(title, "編集後の通知");
    await user.click(screen.getByRole("button", { name: "変更を保存" }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    expect(update).toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        audience: { type: "event_participants", eventId: 2 },
        body: "開始時間を変更します。",
        title: "編集後の通知",
      })
    );
  });
});
