import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  NotificationAudienceInputItemDto,
  NotificationAudienceItemDto,
  NotificationPushDeliveryStatusDto,
  NotificationScheduleStatusDto,
} from "~/features/notifications/api/dto/notification-common-dto";
import {
  parseAdminNotificationDetail,
  parseAdminNotificationListResponse,
  parseNotificationConfig,
  parseNotificationCreateResponse,
} from "~/features/notifications/api/mappers/admin-notification-response-parser";
import {
  readNotificationApiErrorCode,
  readNotificationValidationDetails,
} from "~/features/notifications/api/mappers/notification-api-error-mapper";
import {
  parseNotificationPushDeliveryDetail,
  parseNotificationScheduleDetail,
  parseNotificationScheduleListResponse,
  parseNotificationScheduleResults,
} from "~/features/notifications/api/mappers/notification-schedule-response-parser";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
  notificationApiErrorFixtures,
  notificationConfigFixture,
  notificationPushDeliveryDetailFixture,
  notificationScheduleDetailFixture,
  notificationScheduleListFixture,
  notificationScheduleResultsFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { ClientError } from "~/lib/client-error";

describe("notification v2 contract", () => {
  it("ScheduleとDeliveryのstatusを分離する", () => {
    expectTypeOf<NotificationScheduleStatusDto>().toEqualTypeOf<
      "scheduled" | "resolving" | "sending" | "completed" | "failed" | "stopped"
    >();
    expectTypeOf<NotificationPushDeliveryStatusDto>().toEqualTypeOf<
      "pending" | "sending" | "retry_wait" | "sent" | "failed" | "stopped"
    >();
  });

  it("AudienceのRequestとResponseを別の型にする", () => {
    expectTypeOf<NotificationAudienceInputItemDto>().not.toEqualTypeOf<NotificationAudienceItemDto>();
    const input: NotificationAudienceInputItemDto = {
      type: "event",
      targetId: 81,
    };
    const response: NotificationAudienceItemDto = {
      ...input,
      label: null,
    };
    expect(response.label).toBeNull();
  });

  it("Figma準拠の各Responseを検証してshapeを保持する", () => {
    expect(
      parseAdminNotificationListResponse(adminNotificationListFixture)
    ).toEqual(adminNotificationListFixture);
    expect(
      parseAdminNotificationDetail(adminNotificationDetailFixture)
    ).toEqual(adminNotificationDetailFixture);
    expect(
      parseNotificationScheduleListResponse(notificationScheduleListFixture)
    ).toEqual(notificationScheduleListFixture);
    expect(
      parseNotificationScheduleDetail(notificationScheduleDetailFixture)
    ).toEqual(notificationScheduleDetailFixture);
    expect(
      parseNotificationScheduleResults(notificationScheduleResultsFixture)
    ).toEqual(notificationScheduleResultsFixture);
    expect(
      parseNotificationPushDeliveryDetail(notificationPushDeliveryDetailFixture)
    ).toEqual(notificationPushDeliveryDetailFixture);
    expect(parseNotificationConfig(notificationConfigFixture)).toEqual(
      notificationConfigFixture
    );
    expect(
      parseNotificationCreateResponse({
        notificationId: 108,
        notificationScheduleId: 501,
      })
    ).toEqual({ notificationId: 108, notificationScheduleId: 501 });
  });

  it("旧statusと旧Audienceを拒否する", () => {
    expect(() =>
      parseAdminNotificationListResponse({
        items: [
          {
            ...adminNotificationListFixture.items[0],
            schedules: [
              {
                ...adminNotificationListFixture.items[0].schedules[0],
                status: "draft",
              },
            ],
          },
        ],
      })
    ).toThrow(ClientError);
    expect(() =>
      parseAdminNotificationListResponse({
        items: [
          {
            ...adminNotificationListFixture.items[0],
            schedules: [
              {
                ...adminNotificationListFixture.items[0].schedules[0],
                audience: {
                  items: [{ type: "event_participants", targetId: 81 }],
                  recipientResolution: { status: "resolved", resolvedCount: 1 },
                },
              },
            ],
          },
        ],
      })
    ).toThrow(ClientError);
  });

  it("Recipient数とDelivery数を別の値として保持する", () => {
    expect(notificationScheduleDetailFixture.recipientProgress.count).toBe(40);
    expect(notificationScheduleDetailFixture.deliveryProgress.totalCount).toBe(
      42
    );
  });

  it("VALIDATION_ERRORのfieldErrorsとformErrorsを保持する", () => {
    const error = notificationApiErrorFixtures.VALIDATION_ERROR();
    expect(readNotificationApiErrorCode(error)).toBe("VALIDATION_ERROR");
    expect(readNotificationValidationDetails(error)).toEqual({
      fieldErrors: { title: ["入力してください。"] },
      formErrors: [],
    });
  });
});
