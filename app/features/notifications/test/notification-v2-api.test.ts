import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type { NotificationV2Api } from "~/features/notifications/api/contracts/notification-v2-api";
import type {
  NotificationAudienceItemDto,
  NotificationPushDeliveryStatus,
  NotificationScheduleStatus,
} from "~/features/notifications/api/dto/notification-v2-api-dto";
import { createHttpNotificationV2Api } from "~/features/notifications/api/http/notification-v2-api";
import { mockNotificationV2Api } from "~/features/notifications/mock/notification-v2-api";

describe("通知v2 API契約", () => {
  it("BackendのstatusとAudience literalをそのまま表現する", () => {
    expectTypeOf<NotificationScheduleStatus>().toEqualTypeOf<
      "scheduled" | "resolving" | "sending" | "completed" | "failed" | "stopped"
    >();
    expectTypeOf<NotificationPushDeliveryStatus>().toEqualTypeOf<
      "pending" | "sending" | "retry_wait" | "sent" | "failed" | "stopped"
    >();

    const audience: NotificationAudienceItemDto = {
      type: "event",
      targetId: 21,
      label: "リレー",
    };
    expect(audience.type).toBe("event");
  });

  it("HTTP adapterは共通clientへv2 endpointをそのまま委譲する", async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ items: [] }),
      post: vi
        .fn()
        .mockResolvedValue({ notificationId: 1, notificationScheduleId: 2 }),
      patch: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const api = createHttpNotificationV2Api(client);

    await api.listNotifications({
      from: "2026-11-07T00:00:00.000Z",
      to: "2026-11-08T00:00:00.000Z",
    });
    await api.resendSchedule(501, {
      delivery: { type: "immediate", sendAt: null },
    });
    await api.stopSchedule(501);

    expect(client.get).toHaveBeenCalledWith(
      "/api/v1/admin/notifications?from=2026-11-07T00%3A00%3A00.000Z&to=2026-11-08T00%3A00%3A00.000Z"
    );
    expect(client.post).toHaveBeenCalledWith(
      "/api/v1/admin/notifications/schedules/501/resend",
      {
        delivery: { type: "immediate", sendAt: null },
      }
    );
    expect(client.post).toHaveBeenCalledWith(
      "/api/v1/admin/notifications/schedules/501/stop",
      undefined
    );
  });

  it("Mock adapterも同じ契約を実装する", async () => {
    expectTypeOf(mockNotificationV2Api).toMatchTypeOf<NotificationV2Api>();

    const detail = await mockNotificationV2Api.getNotification(108);
    const results = await mockNotificationV2Api.getScheduleResults(501);

    expect(detail.schedules[0]?.status).toBe("sending");
    expect(results.recipients.items[1]?.deliveries).toEqual([]);
  });
});
