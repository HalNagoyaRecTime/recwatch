import type {
  AdminNotificationDetailDto,
  AdminNotificationListResponseDto,
  NotificationPushDeliveryDetailDto,
  NotificationScheduleDetailDto,
  NotificationScheduleListResponseDto,
  NotificationScheduleResultsResponseDto,
} from "~/features/notifications/api/dto/notification-v2-api-dto";

const date = "2026-11-07T06:35:00.000Z";

const content = {
  push: {
    title: "集合時間変更",
    body: "集合時間が変更されました。",
  },
  detail: {
    title: "集合時間変更のお知らせ",
    body: "詳細をご確認ください。",
  },
};

const creation = {
  method: "automatic" as const,
  user: null,
  source: {
    type: "gathering" as const,
    id: 51,
    label: "第1集合",
  },
};

const audience = {
  items: [
    {
      type: "gathering" as const,
      targetId: 51,
      label: "第1集合",
    },
  ],
  recipientResolution: {
    status: "resolved" as const,
    resolvedCount: 4,
  },
};

const recipientPushSummary = {
  totalCount: 4,
  successCount: 3,
  failedCount: 0,
  noPushTargetCount: 1,
};

export const notificationV2DetailFixture: AdminNotificationDetailDto = {
  notificationId: 108,
  content,
  importance: "normal",
  creation,
  createdAt: date,
  updatedAt: date,
  schedules: [
    {
      notificationScheduleId: 501,
      sendAt: date,
      status: "sending",
      stop: null,
      scheduledBy: null,
      createdAt: date,
      audience,
      recipientPushSummary,
    },
  ],
};

export const notificationV2ListFixture: AdminNotificationListResponseDto = {
  items: [
    {
      notificationId: notificationV2DetailFixture.notificationId,
      content: { push: content.push },
      importance: "normal",
      creation,
      createdAt: date,
      schedules: [
        {
          notificationScheduleId: 501,
          sendAt: date,
          status: "sending",
          scheduledBy: null,
          createdAt: date,
          audience,
          recipientPushSummary,
        },
      ],
    },
  ],
};

export const notificationV2ScheduleListFixture: NotificationScheduleListResponseDto =
  {
    items: [
      {
        notificationId: 108,
        notificationScheduleId: 501,
        content: { push: content.push },
        importance: "normal",
        sendAt: date,
        status: "sending",
        stop: null,
        creation,
      },
    ],
  };

export const notificationV2ScheduleDetailFixture: NotificationScheduleDetailDto =
  {
    ...notificationV2ScheduleListFixture.items[0],
    audienceProgress: {
      totalCount: 1,
      resolvedCount: 1,
    },
    recipientProgress: {
      count: 4,
      status: "resolved",
    },
    deliveryProgress: {
      totalCount: 3,
      pendingCount: 0,
      sendingCount: 1,
      retryWaitCount: 0,
      sentCount: 2,
      failedCount: 0,
      stoppedCount: 0,
    },
  };

export const notificationV2ResultsFixture: NotificationScheduleResultsResponseDto =
  {
    notificationScheduleId: 501,
    recipients: {
      items: [
        {
          notificationRecipientId: 1201,
          user: {
            userId: 123,
            userName: "HAL 太郎",
          },
          deliveries: [
            {
              notificationPushDeliveryId: 9012,
              platform: "ios",
              status: "sent",
              attemptCount: 1,
              lastAttemptAt: date,
              sentAt: date,
            },
          ],
        },
        {
          notificationRecipientId: 1202,
          user: {
            userId: 124,
            userName: "HAL 花子",
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

export const notificationV2PushDeliveryFixture: NotificationPushDeliveryDetailDto =
  {
    notificationPushDeliveryId: 9012,
    notificationRecipientId: 1201,
    firebaseTokenId: 44,
    platform: "ios",
    status: "sent",
    attemptCount: 1,
    firstAttemptAt: date,
    lastAttemptAt: date,
    nextRetryAt: null,
    sentAt: date,
    failedReason: null,
    fcmMessageId: "projects/rectime/messages/9012",
  };
