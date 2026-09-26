import type {
  AdminNotificationDetailDto,
  AdminNotificationListResponseDto,
  NotificationConfigDto,
} from "~/features/notifications/api/dto/admin-notification-dto";
import type { NotificationApiErrorCode } from "~/features/notifications/api/dto/notification-error-dto";
import type {
  NotificationPushDeliveryDetailDto,
  NotificationScheduleDetailDto,
  NotificationScheduleListResponseDto,
  NotificationScheduleResultsDto,
} from "~/features/notifications/api/dto/notification-schedule-dto";
import type { NotificationScheduleStatusDto } from "~/features/notifications/api/dto/notification-common-dto";
import { ApiClientError } from "~/lib/api-client-error";

const scheduleStatuses: NotificationScheduleStatusDto[] = [
  "scheduled",
  "resolving",
  "sending",
  "completed",
  "failed",
  "stopped",
];

export const adminNotificationListFixture: AdminNotificationListResponseDto = {
  items: scheduleStatuses.map((status, index) => {
    const notificationId = 101 + index;
    const isAutomatic = index === 1 || index === 5;
    return {
      notificationId,
      content: {
        push: {
          title: `通知${notificationId}`,
          body: `${status}状態の通知です。`,
        },
      },
      importance: index === 4 ? "high" : "normal",
      creation: isAutomatic
        ? {
            method: "automatic" as const,
            user: null,
            source: {
              type: "gathering" as const,
              id: 51 + index,
              label: index === 5 ? null : `第${index}集合`,
            },
          }
        : {
            method: "manual" as const,
            user: { userId: 123, userName: "HAL 太郎" },
            source: null,
          },
      createdAt: `2026-11-07T0${index + 7}:00:00+09:00`,
      schedules: [
        {
          notificationScheduleId: 501 + index,
          sendAt: `2026-11-07T${String(index + 9).padStart(2, "0")}:20:00+09:00`,
          status,
          scheduledBy: isAutomatic
            ? null
            : { userId: 123, userName: "HAL 太郎" },
          createdAt: `2026-11-07T0${index + 7}:05:00+09:00`,
          audience: {
            items: [
              index === 0
                ? { type: "all" as const }
                : {
                    type: "gathering" as const,
                    targetId: 51 + index,
                    label: index === 5 ? null : `第${index}集合`,
                  },
            ],
            recipientResolution: {
              status: status === "scheduled" ? "pending" : "resolved",
              resolvedCount: status === "scheduled" ? 0 : 40,
            },
          },
          recipientPushSummary: {
            totalCount: 42,
            successCount: status === "completed" ? 38 : 0,
            failedCount: status === "failed" ? 2 : 0,
            noPushTargetCount: 2,
          },
        },
      ],
    };
  }),
};

export const adminNotificationDetailFixture: AdminNotificationDetailDto = {
  notificationId: 103,
  content: {
    push: {
      title: "競技開始時間の変更",
      body: "男子100mの開始時間が変更されました。",
    },
    detail: {
      title: "競技開始時間変更のお知らせ",
      body: "男子100mの開始時間が13:20へ変更されました。",
    },
  },
  importance: "normal",
  creation: {
    method: "manual",
    user: { userId: 123, userName: "HAL 太郎" },
    source: null,
  },
  createdAt: "2026-11-07T12:10:00+09:00",
  updatedAt: "2026-11-07T12:15:00+09:00",
  schedules: [
    {
      ...adminNotificationListFixture.items[3].schedules[0],
      stop: null,
    },
    {
      ...adminNotificationListFixture.items[5].schedules[0],
      stop: {
        reason: "source_deleted",
        stoppedAt: "2026-11-07T13:00:00+09:00",
        stoppedBy: null,
      },
    },
  ],
};

export const notificationScheduleListFixture: NotificationScheduleListResponseDto =
  {
    items: adminNotificationListFixture.items.flatMap((notification) =>
      notification.schedules.map((schedule) => ({
        notificationId: notification.notificationId,
        notificationScheduleId: schedule.notificationScheduleId,
        content: notification.content,
        importance: notification.importance,
        sendAt: schedule.sendAt,
        status: schedule.status,
        stop:
          schedule.status === "stopped"
            ? {
                reason: "source_deleted" as const,
                stoppedAt: schedule.sendAt,
                stoppedBy: null,
              }
            : null,
        creation: notification.creation,
      }))
    ),
  };

export const notificationScheduleDetailFixture: NotificationScheduleDetailDto =
  {
    ...notificationScheduleListFixture.items[2],
    audienceProgress: { totalCount: 4, resolvedCount: 4 },
    recipientProgress: { count: 40, status: "resolved" },
    deliveryProgress: {
      totalCount: 42,
      pendingCount: 0,
      sendingCount: 0,
      retryWaitCount: 2,
      sentCount: 38,
      failedCount: 2,
      stoppedCount: 0,
    },
  };

export const notificationScheduleResultsFixture: NotificationScheduleResultsDto =
  {
    notificationScheduleId: 503,
    recipients: {
      items: [
        {
          notificationRecipientId: 1201,
          user: { userId: 1, userName: "山田 太郎" },
          deliveries: [
            {
              notificationPushDeliveryId: 9011,
              platform: "android",
              status: "sent",
              attemptCount: 1,
              lastAttemptAt: "2026-11-07T13:20:05+09:00",
              sentAt: "2026-11-07T13:20:05+09:00",
            },
            {
              notificationPushDeliveryId: 9012,
              platform: "ios",
              status: "retry_wait",
              attemptCount: 2,
              lastAttemptAt: "2026-11-07T13:20:08+09:00",
              sentAt: null,
            },
          ],
        },
        {
          notificationRecipientId: 1202,
          user: { userId: 2, userName: "佐藤 花子" },
          deliveries: [],
        },
      ],
      pagination: { page: 1, limit: 50, totalCount: 2, totalPages: 1 },
    },
  };

export const notificationPushDeliveryDetailFixture: NotificationPushDeliveryDetailDto =
  {
    notificationPushDeliveryId: 9012,
    notificationRecipientId: 1201,
    firebaseTokenId: null,
    platform: "ios",
    status: "retry_wait",
    attemptCount: 2,
    firstAttemptAt: "2026-11-07T13:20:04+09:00",
    lastAttemptAt: "2026-11-07T13:20:08+09:00",
    nextRetryAt: "2026-11-07T13:25:08+09:00",
    sentAt: null,
    failedReason: "UNAVAILABLE",
    fcmMessageId: null,
  };

export const notificationConfigFixture: NotificationConfigDto = {
  importance: { default: "normal", options: ["low", "normal", "high"] },
};

export const notificationApiErrorFixtures = {
  VALIDATION_ERROR: () =>
    new ApiClientError(
      400,
      "リクエスト内容が正しくありません。",
      "VALIDATION_ERROR",
      { fieldErrors: { title: ["入力してください。"] }, formErrors: [] }
    ),
  STAFF_REQUIRED: () =>
    new ApiClientError(403, "権限がありません。", "STAFF_REQUIRED"),
  ADMIN_NOTIFICATION_NOT_FOUND: () =>
    new ApiClientError(
      404,
      "通知が見つかりません。",
      "ADMIN_NOTIFICATION_NOT_FOUND"
    ),
  NOTIFICATION_EDIT_NOT_ALLOWED: () =>
    new ApiClientError(
      409,
      "通知を編集できません。",
      "NOTIFICATION_EDIT_NOT_ALLOWED"
    ),
  UNKNOWN_API_ERROR: () =>
    new ApiClientError(500, "通知処理に失敗しました。", "UNKNOWN_API_ERROR"),
} satisfies Partial<
  Record<NotificationApiErrorCode | "UNKNOWN_API_ERROR", () => ApiClientError>
>;

export function cloneFixture<T>(value: T): T {
  return structuredClone(value);
}
