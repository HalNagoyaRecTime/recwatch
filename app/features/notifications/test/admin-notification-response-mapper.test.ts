import { describe, expect, it } from "vitest";

import { NotificationSubmissionError } from "~/features/notifications/application/notification-submission-error";
import { toNotificationSubmission } from "~/features/notifications/infrastructure/admin-notification-response-mapper";

describe("toNotificationSubmission", () => {
  it("API ResponseをApplicationの結果へ変換する", () => {
    expect(
      toNotificationSubmission({
        notification_id: 10,
        schedule_count: 120,
        send_status: "draft",
        ignored_external_field: "value",
      })
    ).toEqual({
      notificationId: 10,
      scheduleCount: 120,
      status: "draft",
    });
  });

  it("不正なAPI Responseを受け取るとunexpectedエラーに変換する", () => {
    expect(() =>
      toNotificationSubmission({
        notification_id: "10",
        schedule_count: 120,
        send_status: "draft",
      })
    ).toThrow(new NotificationSubmissionError("unexpected"));
  });
});
