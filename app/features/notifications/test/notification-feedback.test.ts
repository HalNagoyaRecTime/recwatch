import { describe, expect, it, vi } from "vitest";

import {
  reportNotificationActionError,
  reportNotificationBackgroundError,
} from "~/features/notifications/hooks/notification-feedback";
import { ApiClientError } from "~/lib/api-client-error";

describe("notification feedback", () => {
  it("mutation失敗をaction-errorとして診断情報付きで通知する", () => {
    const report = vi.fn();
    reportNotificationActionError(report, {
      title: "通知を更新できませんでした",
      message: "現在の状態では編集できません。",
      action: "notification.patch",
      endpoint: "/api/v1/admin/notifications/103",
      error: new ApiClientError(
        409,
        "現在の状態では編集できません。",
        "NOTIFICATION_EDIT_NOT_ALLOWED"
      ),
    });

    expect(report).toHaveBeenCalledWith({
      kind: "action-error",
      title: "通知を更新できませんでした",
      message: "現在の状態では編集できません。",
      diagnostic: {
        action: "notification.patch",
        endpoint: "/api/v1/admin/notifications/103",
        status: 409,
        errorCode: "NOTIFICATION_EDIT_NOT_ALLOWED",
      },
    });
  });

  it("再読み込み失敗をbackground-errorとして通知する", () => {
    const report = vi.fn();
    reportNotificationBackgroundError(report, {
      title: "通知一覧を更新できませんでした",
      message: "通信に失敗しました。",
      action: "notification.list.reload",
      endpoint: "/api/v1/admin/notifications",
      error: new Error("network"),
    });

    expect(report).toHaveBeenCalledWith({
      kind: "background-error",
      title: "通知一覧を更新できませんでした",
      message: "通信に失敗しました。",
      diagnostic: {
        action: "notification.list.reload",
        endpoint: "/api/v1/admin/notifications",
      },
    });
  });
});
