import { describe, expect, it } from "vitest";

import { mockEventNotificationGateway } from "./mock-event-notification-gateway";

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
});
