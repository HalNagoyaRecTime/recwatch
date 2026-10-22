import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  AdminNotificationDetailDto,
  AdminNotificationListItemDto,
} from "~/features/notifications/api/dto/admin-notification-dto";
import type {
  AdminNotificationDetail,
  AdminNotificationListItem,
  NotificationAudienceItem,
} from "~/features/notifications/api/contracts/admin-notification-types";
import {
  NOTIFICATION_AUDIENCE_TYPES,
  NOTIFICATION_CREATION_METHODS,
  NOTIFICATION_DELIVERY_TYPES,
  NOTIFICATION_IMPORTANCE_LEVELS,
  NOTIFICATION_PLATFORMS,
  NOTIFICATION_PUSH_DELIVERY_STATUSES,
  NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES,
  NOTIFICATION_SCHEDULE_STATUSES,
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_STOP_REASONS,
  NOTIFICATION_TARGET_AUDIENCE_TYPES,
  type NotificationAudienceDto,
  type NotificationAudienceInputItemDto,
  type NotificationAudienceItemDto,
  type NotificationPushDeliveryStatusDto,
  type NotificationScheduleAudienceDto,
  type NotificationScheduleStatusDto,
} from "~/features/notifications/api/dto/notification-common-dto";
import { notificationApiErrorCodes } from "~/features/notifications/api/contracts/notification-error";
import { notificationAudienceTypes } from "~/features/notifications/model/notification-audience";
import { notificationImportanceLevels } from "~/features/notifications/model/notification-draft";
import {
  parseAdminNotificationDetail,
  parseAdminNotificationListResponse,
  parseNotificationConfig,
  parseNotificationCreateResponse,
} from "~/features/notifications/api/mappers/admin-notification-response-parser";
import {
  readNotificationApiErrorCode,
  readNotificationValidationDetails,
} from "~/features/notifications/api/contracts/notification-error";
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

function parseListWithAudienceItem(audienceItem: unknown) {
  const notification = adminNotificationListFixture.items[0];
  const schedule = notification.schedules[0];
  return parseAdminNotificationListResponse({
    items: [
      {
        ...notification,
        schedules: [
          {
            ...schedule,
            audience: { ...schedule.audience, items: [audienceItem] },
          },
        ],
      },
    ],
  });
}

describe("notification v2 contract", () => {
  it("ScheduleとDeliveryのstatusを分離する", () => {
    expectTypeOf<NotificationScheduleStatusDto>().toEqualTypeOf<
      "scheduled" | "resolving" | "sending" | "completed" | "failed" | "stopped"
    >();
    expectTypeOf<NotificationPushDeliveryStatusDto>().toEqualTypeOf<
      "pending" | "sending" | "retry_wait" | "sent" | "failed" | "stopped"
    >();
  });

  it("通知契約の値がAPI定義と一致する", () => {
    expect(NOTIFICATION_SCHEDULE_STATUSES).toEqual([
      "scheduled",
      "resolving",
      "sending",
      "completed",
      "failed",
      "stopped",
    ]);
    expect(NOTIFICATION_PUSH_DELIVERY_STATUSES).toEqual([
      "pending",
      "sending",
      "retry_wait",
      "sent",
      "failed",
      "stopped",
    ]);
    expect(NOTIFICATION_IMPORTANCE_LEVELS).toEqual(["low", "normal", "high"]);
    expect(NOTIFICATION_PLATFORMS).toEqual(["ios", "android"]);
    expect(NOTIFICATION_TARGET_AUDIENCE_TYPES).toEqual([
      "class_room",
      "gathering",
      "event",
      "user",
    ]);
    expect(NOTIFICATION_AUDIENCE_TYPES).toEqual([
      "all",
      "class_room",
      "gathering",
      "event",
      "user",
    ]);
    expect(NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES).toEqual([
      "pending",
      "resolved",
    ]);
    expect(NOTIFICATION_DELIVERY_TYPES).toEqual(["immediate", "scheduled"]);
    expect(NOTIFICATION_CREATION_METHODS).toEqual(["manual", "automatic"]);
    expect(NOTIFICATION_SOURCE_TYPES).toEqual(["gathering"]);
    expect(NOTIFICATION_STOP_REASONS).toEqual(["manual", "source_deleted"]);
    expect(notificationAudienceTypes).toEqual(NOTIFICATION_AUDIENCE_TYPES);
    expect(notificationImportanceLevels).toEqual(
      NOTIFICATION_IMPORTANCE_LEVELS
    );
    expect(notificationApiErrorCodes).toEqual([
      "VALIDATION_ERROR",
      "UNAUTHORIZED",
      "STAFF_REQUIRED",
      "ADMIN_NOTIFICATION_NOT_FOUND",
      "NOTIFICATION_SCHEDULE_NOT_FOUND",
      "NOTIFICATION_AUDIENCE_NOT_FOUND",
      "NOTIFICATION_IMPORTANCE_FORBIDDEN",
      "NOTIFICATION_PUSH_DELIVERY_NOT_FOUND",
      "NOTIFICATION_EDIT_NOT_ALLOWED",
      "NOTIFICATION_DELETE_NOT_ALLOWED",
      "NOTIFICATION_SCHEDULE_CANCEL_NOT_ALLOWED",
      "NOTIFICATION_SCHEDULE_STOP_NOT_ALLOWED",
      "NOTIFICATION_RESEND_NOT_ALLOWED",
    ]);
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

  it("Audienceの基底型とSchedule用型を分離する", () => {
    expectTypeOf<NotificationAudienceDto>().toEqualTypeOf<{
      items: NotificationAudienceItemDto[];
    }>();
    expectTypeOf<NotificationScheduleAudienceDto>().toEqualTypeOf<
      NotificationAudienceDto & {
        recipientResolution: {
          status: "pending" | "resolved";
          resolvedCount: number;
        };
      }
    >();
  });

  it("Schedule audienceはrecipientResolutionを必須にする", () => {
    const notification = adminNotificationListFixture.items[0];
    const schedule = notification.schedules[0];

    expect(() =>
      parseAdminNotificationListResponse({
        items: [
          {
            ...notification,
            schedules: [
              {
                ...schedule,
                audience: { items: schedule.audience.items },
              },
            ],
          },
        ],
      })
    ).toThrow(ClientError);
  });

  it("Contract型はDTOのaliasを利用する", () => {
    expectTypeOf<AdminNotificationDetail>().toEqualTypeOf<AdminNotificationDetailDto>();
    expectTypeOf<AdminNotificationListItem>().toEqualTypeOf<AdminNotificationListItemDto>();
    expectTypeOf<NotificationAudienceItem>().toEqualTypeOf<NotificationAudienceItemDto>();
  });

  it("Audience Responseのlabelとall itemをBackend契約通り検証する", () => {
    expect(
      parseListWithAudienceItem({
        type: "gathering",
        targetId: 51,
        label: "表示名",
      }).items[0].schedules[0].audience.items[0]
    ).toEqual({ type: "gathering", targetId: 51, label: "表示名" });
    expect(
      parseListWithAudienceItem({
        type: "gathering",
        targetId: 51,
        label: null,
      }).items[0].schedules[0].audience.items[0]
    ).toEqual({ type: "gathering", targetId: 51, label: null });
    expect(() =>
      parseListWithAudienceItem({ type: "gathering", targetId: 51 })
    ).toThrow(ClientError);
    expect(
      parseListWithAudienceItem({ type: "all" }).items[0].schedules[0].audience
        .items[0]
    ).toEqual({ type: "all" });
    expect(() =>
      parseListWithAudienceItem({ type: "all", label: null })
    ).toThrow(ClientError);
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
      fieldErrors: { content: ["入力してください。"] },
      formErrors: [],
    });
  });
});
