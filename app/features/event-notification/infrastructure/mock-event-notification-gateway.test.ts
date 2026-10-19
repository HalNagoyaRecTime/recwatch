import { describe, expect, it } from "vitest";

import {
  createMockEventNotificationGateway,
  mockEventNotificationGateway,
} from "./mock-event-notification-gateway";

describe("mockEventNotificationGateway", () => {
  it("場所だけの変更では自動通知を新規作成しない", async () => {
    await mockEventNotificationGateway.patchEvent({
      eventId: 901,
      venue: "コートB",
    });

    await expect(
      mockEventNotificationGateway.getNotificationSummary(901)
    ).resolves.toMatchObject({
      status: "none",
      total: 0,
    });
  });

  it("通知を有効にするとdraftを作成し、無効にすると削除する", async () => {
    await mockEventNotificationGateway.patchEvent({
      eventId: 902,
      notificationEnabled: true,
    });
    await expect(
      mockEventNotificationGateway.getNotificationSummary(902)
    ).resolves.toMatchObject({
      status: "draft",
      draft: 30,
    });

    await mockEventNotificationGateway.patchEvent({
      eventId: 902,
      notificationEnabled: false,
    });
    await expect(
      mockEventNotificationGateway.getNotificationSummary(902)
    ).resolves.toMatchObject({
      status: "none",
      total: 0,
    });
  });

  it("通知OFFではdraftだけを削除し、送信履歴を保持する", async () => {
    const gateway = createMockEventNotificationGateway([
      {
        eventId: 903,
        scheduledAt: "2026-11-07T08:55:00+09:00",
        total: 11,
        draft: 5,
        sending: 2,
        sent: 3,
        failed: 1,
        status: "failed",
        hasUpcomingNotification: true,
      },
    ]);

    await gateway.patchEvent({
      eventId: 903,
      notificationEnabled: false,
    });

    await expect(gateway.getNotificationSummary(903)).resolves.toMatchObject({
      total: 6,
      draft: 0,
      sending: 2,
      sent: 3,
      failed: 1,
      status: "failed",
      hasUpcomingNotification: true,
    });
  });

  it("再生成ではdraftだけを差し替え、送信履歴を保持する", async () => {
    const gateway = createMockEventNotificationGateway([
      {
        eventId: 904,
        scheduledAt: "2026-11-07T08:55:00+09:00",
        total: 11,
        draft: 5,
        sending: 2,
        sent: 3,
        failed: 1,
        status: "failed",
        hasUpcomingNotification: true,
      },
    ]);

    await gateway.patchEvent({
      eventId: 904,
      startTime: "10:00",
    });

    await expect(gateway.getNotificationSummary(904)).resolves.toMatchObject({
      total: 36,
      draft: 30,
      sending: 2,
      sent: 3,
      failed: 1,
      status: "failed",
      hasUpcomingNotification: true,
    });
  });
});
