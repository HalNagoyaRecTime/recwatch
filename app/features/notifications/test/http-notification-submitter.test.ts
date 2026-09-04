import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { createHttpNotificationSubmissionApi } from "~/features/notifications/api/http/notification-submission-api";

const draft: NotificationDraft = {
  title: "集合場所変更",
  body: "集合場所は体育館です。",
  audienceType: "class_room",
  audienceId: "3",
};

describe("createHttpNotificationSubmissionApi", () => {
  it("管理者通知APIへ送信して結果を正規化する", async () => {
    const post = vi.fn().mockResolvedValue({
      notification_id: 7,
      schedule_count: 30,
      send_status: "draft",
    });
    const submitter = createHttpNotificationSubmissionApi(
      { post },
      () => new Date("2026-11-07T09:00:00+09:00")
    );

    await expect(submitter.submit(draft)).resolves.toEqual({
      notificationId: 7,
      scheduleCount: 30,
      status: "draft",
    });
    expect(post).toHaveBeenCalledWith("/api/v1/admin/notifications", {
      title: "集合場所変更",
      body: "集合場所は体育館です。",
      audience: { type: "class_room", classRoomId: 3 },
      scheduledAt: "2026-11-07T00:00:00.000Z",
    });
  });

  it.each([
    [400, "invalid_request"],
    [401, "authentication_required"],
    [403, "forbidden"],
    [404, "audience_not_found"],
    [409, "no_active_devices"],
    [500, "unexpected"],
  ] as const)("HTTP %sのApiClientErrorをそのまま伝播する", async (...args) => {
    const [status] = args;
    const submitter = createHttpNotificationSubmissionApi({
      post: vi.fn().mockRejectedValue(new ApiClientError(status, "error")),
    });

    await expect(submitter.submit(draft)).rejects.toEqual(
      new ApiClientError(status, "error")
    );
  });
});
