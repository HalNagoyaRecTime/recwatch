import { describe, expect, it } from "vitest";

import {
  formatNotificationDraftErrors,
  formatNotificationSubmissionErrors,
  formatNotificationDateTime,
} from "~/features/notifications/components/notification-display";

describe("通知入力の表示変換", () => {
  it("業務検証のコードとサーバーの文言を区別して表示する", () => {
    expect(
      formatNotificationDraftErrors({
        scheduledAt: { kind: "validation", code: "schedule_not_future" },
        importance: { kind: "api", message: "この重要度は選べません" },
      })
    ).toEqual({
      scheduledAt: "現在より後の日時を指定してください",
      importance: "この重要度は選べません",
    });
  });

  it("APIのグループ名は表示段階で日本語に変換する", () => {
    expect(
      formatNotificationSubmissionErrors(
        [{ field: "content", message: "内容を確認してください" }],
        null
      )
    ).toBe("通知内容: 内容を確認してください");
  });

  it("未設定や不正な日時はハイフンにする", () => {
    expect(formatNotificationDateTime(undefined)).toBe("-");
    expect(formatNotificationDateTime("invalid")).toBe("-");
  });
});
