import {
  notificationScheduleStatuses,
  type NotificationScheduleDetailDto,
  type NotificationScheduleListItemDto,
  type NotificationScheduleResultsResponseDto,
} from "~/features/notifications/api/dto/notification-v2-api-dto";

const date = "2026-11-07T06:35:00.000Z";

const manualCreation = {
  method: "manual" as const,
  user: {
    userId: 10,
    userName: "管理者",
  },
  source: null,
};

const automaticDeletedSourceCreation = {
  method: "automatic" as const,
  user: null,
  source: {
    type: "gathering" as const,
    id: 99,
    label: null,
  },
};

export const notificationV2ScheduleStatusFixtures: NotificationScheduleListItemDto[] =
  notificationScheduleStatuses.map((status, index) => ({
    notificationId: 200 + index,
    notificationScheduleId: 600 + index,
    content: {
      push: {
        title: "通知",
        body: "通知本文",
      },
    },
    importance: "normal",
    sendAt: date,
    status,
    stop:
      status === "stopped"
        ? {
            reason: "manual",
            stoppedAt: date,
            stoppedBy: manualCreation.user,
          }
        : null,
    creation: index === 0 ? manualCreation : automaticDeletedSourceCreation,
  }));

export const notificationV2RetryWaitScheduleFixture: NotificationScheduleDetailDto =
  {
    ...notificationV2ScheduleStatusFixtures[2],
    audienceProgress: {
      totalCount: 2,
      resolvedCount: 2,
    },
    recipientProgress: {
      count: 2,
      status: "resolved",
    },
    deliveryProgress: {
      totalCount: 3,
      pendingCount: 0,
      sendingCount: 0,
      retryWaitCount: 1,
      sentCount: 1,
      failedCount: 1,
      stoppedCount: 0,
    },
  };

export const notificationV2RecipientScenarioFixture: NotificationScheduleResultsResponseDto =
  {
    notificationScheduleId: 602,
    recipients: {
      items: [
        {
          notificationRecipientId: 1301,
          user: {
            userId: 201,
            userName: "複数端末ユーザー",
          },
          deliveries: [
            {
              notificationPushDeliveryId: 9201,
              platform: "ios",
              status: "sent",
              attemptCount: 1,
              lastAttemptAt: date,
              sentAt: date,
            },
            {
              notificationPushDeliveryId: 9202,
              platform: "android",
              status: "retry_wait",
              attemptCount: 2,
              lastAttemptAt: date,
              sentAt: null,
            },
          ],
        },
        {
          notificationRecipientId: 1302,
          user: {
            userId: 202,
            userName: "Tokenなしユーザー",
          },
          deliveries: [],
        },
      ],
      pagination: {
        page: 1,
        limit: 50,
        totalCount: 2,
        totalPages: 1,
      },
    },
  };
