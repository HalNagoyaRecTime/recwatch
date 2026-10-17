import { describe, expect, it } from "vitest";

import { mockAdminNotificationQueryApi } from "~/features/notifications/mock/admin-notification-query-api";
import { mockNotificationPushDeliveryApi } from "~/features/notifications/mock/notification-push-delivery-api";
import { mockNotificationScheduleQueryApi } from "~/features/notifications/mock/notification-schedule-query-api";

describe("notification v2 mock adapters", () => {
  it("Scheduleの6状態とmanual・automaticを返す", async () => {
    const response = await mockAdminNotificationQueryApi.list();
    expect(response.items.map((item) => item.schedules[0].status)).toEqual([
      "scheduled",
      "resolving",
      "sending",
      "completed",
      "failed",
      "stopped",
    ]);
    expect(response.items.map((item) => item.creation.method)).toContain(
      "manual"
    );
    expect(response.items.map((item) => item.creation.method)).toContain(
      "automatic"
    );
  });

  it("削除済みsourceのnull labelを返す", async () => {
    const response = await mockAdminNotificationQueryApi.list();
    const automatic = response.items.find(
      (item) =>
        item.creation.method === "automatic" &&
        item.creation.source.label === null
    );
    expect(automatic).toBeDefined();
  });

  it("期間指定時は該当Scheduleだけを同じ一覧契約で返す", async () => {
    const response = await mockAdminNotificationQueryApi.list({
      from: "2026-11-08T00:00:00+09:00",
      to: "2026-11-08T23:59:59+09:00",
    });

    expect(response.items).toHaveLength(1);
    expect(response.items[0].notificationId).toBe(101);
    expect(response.items[0].schedules).toHaveLength(1);
    expect(response.items[0].schedules[0].notificationScheduleId).toBe(601);
  });

  it("TokenなしRecipientと1 User複数Deliveryを返す", async () => {
    const response = await mockNotificationScheduleQueryApi.getResults(503, {
      page: 1,
      limit: 50,
    });
    expect(response.recipients.items[0].deliveries).toHaveLength(2);
    expect(response.recipients.items[1].deliveries).toEqual([]);
  });

  it("retry_waitのDelivery詳細を返す", async () => {
    const response = await mockNotificationPushDeliveryApi.getDetail(9012);
    expect(response.status).toBe("retry_wait");
  });
});
