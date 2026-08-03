import { describe, expect, it } from "vitest";

import { NotificationManagementError } from "../application/notification-management-error";
import {
  toManagedNotification,
  toManagedNotificationPage,
} from "../infrastructure/admin-notification-management-response-mapper";
import { createAdminNotificationResponse } from "../infrastructure/admin-notification-management-test-fixture";

describe("admin notification response mapper", () => {
  it.each([
    [{ total: 2, draft: 2, sending: 0, sent: 0, failed: 0 }, "draft"],
    [{ total: 2, draft: 0, sending: 2, sent: 0, failed: 0 }, "sending"],
    [{ total: 2, draft: 0, sending: 0, sent: 2, failed: 0 }, "sent"],
    [{ total: 2, draft: 0, sending: 0, sent: 1, failed: 1 }, "failed"],
    [{ total: 2, draft: 1, sending: 0, sent: 1, failed: 0 }, "sending"],
  ] as const)("配信件数から%s状態を導出する", (deliverySummary, status) => {
    expect(
      toManagedNotification(
        createAdminNotificationResponse({
          recipient_count: 2,
          audience: {
            type: "resolved_recipients",
            recipient_count: 2,
          },
          delivery_summary: deliverySummary,
        })
      ).status
    ).toBe(status);
  });

  it("一覧Responseを画面モデルへ正規化する", () => {
    const page = toManagedNotificationPage({
      notifications: [
        createAdminNotificationResponse({
          related_event_id: 3,
          related_event_name: "リレー",
          audience: {
            type: "event_participants",
            event_id: 3,
            recipient_count: 30,
          },
        }),
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });

    expect(page.notifications[0]).toMatchObject({
      id: 10,
      audienceName: "競技参加者（30名）",
      relatedEventId: 3,
      relatedEventName: "リレー",
      status: "draft",
    });
  });

  it("件数の合計が一致しないResponseを拒否する", () => {
    expect(() =>
      toManagedNotification(
        createAdminNotificationResponse({
          delivery_summary: {
            total: 30,
            draft: 29,
            sending: 0,
            sent: 0,
            failed: 0,
          },
        })
      )
    ).toThrow(new NotificationManagementError("unexpected"));
  });
});
