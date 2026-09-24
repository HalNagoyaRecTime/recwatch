import type { NotificationV2Api } from "~/features/notifications/api/contracts/notification-v2-api";
import { ApiClientError } from "~/lib/api-client-error";

import {
  notificationV2DetailFixture,
  notificationV2ListFixture,
  notificationV2PushDeliveryFixture,
  notificationV2ResultsFixture,
  notificationV2ScheduleDetailFixture,
  notificationV2ScheduleListFixture,
} from "./notification-v2-fixtures";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const mockNotificationV2Api: NotificationV2Api = {
  async listNotifications() {
    return clone(notificationV2ListFixture);
  },
  async getNotification(notificationId) {
    if (notificationId !== notificationV2DetailFixture.notificationId) {
      throw notFound("ADMIN_NOTIFICATION_NOT_FOUND", "通知が見つかりません");
    }
    return clone(notificationV2DetailFixture);
  },
  async createNotification() {
    return {
      notificationId: 109,
      notificationScheduleId: 502,
    };
  },
  async patchNotification(notificationId) {
    if (notificationId !== notificationV2DetailFixture.notificationId) {
      throw notFound("ADMIN_NOTIFICATION_NOT_FOUND", "通知が見つかりません");
    }
    return clone(notificationV2DetailFixture);
  },
  async deleteNotification(notificationId) {
    if (notificationId !== notificationV2DetailFixture.notificationId) {
      throw notFound("ADMIN_NOTIFICATION_NOT_FOUND", "通知が見つかりません");
    }
  },
  async getConfig() {
    return {
      importance: {
        default: "normal",
        options: ["low", "normal"],
      },
    };
  },
  async countAudience() {
    return { recipientCount: 4 };
  },
  async listSchedules() {
    return clone(notificationV2ScheduleListFixture);
  },
  async getSchedule(notificationScheduleId) {
    if (
      notificationScheduleId !==
      notificationV2ScheduleDetailFixture.notificationScheduleId
    ) {
      throw notFound(
        "NOTIFICATION_SCHEDULE_NOT_FOUND",
        "通知スケジュールが見つかりません"
      );
    }
    return clone(notificationV2ScheduleDetailFixture);
  },
  async getScheduleResults(notificationScheduleId) {
    if (
      notificationScheduleId !==
      notificationV2ResultsFixture.notificationScheduleId
    ) {
      throw notFound(
        "NOTIFICATION_SCHEDULE_NOT_FOUND",
        "通知スケジュールが見つかりません"
      );
    }
    return clone(notificationV2ResultsFixture);
  },
  async deleteSchedule(notificationScheduleId) {
    if (
      notificationScheduleId !==
      notificationV2ScheduleDetailFixture.notificationScheduleId
    ) {
      throw notFound(
        "NOTIFICATION_SCHEDULE_NOT_FOUND",
        "通知スケジュールが見つかりません"
      );
    }
  },
  async resendSchedule(notificationScheduleId) {
    if (
      notificationScheduleId !==
      notificationV2ScheduleDetailFixture.notificationScheduleId
    ) {
      throw notFound(
        "NOTIFICATION_SCHEDULE_NOT_FOUND",
        "通知スケジュールが見つかりません"
      );
    }
    return {
      notificationId: notificationV2DetailFixture.notificationId,
      notificationScheduleId: 503,
    };
  },
  async stopSchedule(notificationScheduleId) {
    if (
      notificationScheduleId !==
      notificationV2ScheduleDetailFixture.notificationScheduleId
    ) {
      throw notFound(
        "NOTIFICATION_SCHEDULE_NOT_FOUND",
        "通知スケジュールが見つかりません"
      );
    }
    return {
      notificationScheduleId,
      status: "stopped",
    };
  },
  async getPushDelivery(notificationPushDeliveryId) {
    if (
      notificationPushDeliveryId !==
      notificationV2PushDeliveryFixture.notificationPushDeliveryId
    ) {
      throw notFound(
        "NOTIFICATION_PUSH_DELIVERY_NOT_FOUND",
        "Push配信が見つかりません"
      );
    }
    return clone(notificationV2PushDeliveryFixture);
  },
};

function notFound(code: string, message: string) {
  return new ApiClientError(404, message, code);
}
