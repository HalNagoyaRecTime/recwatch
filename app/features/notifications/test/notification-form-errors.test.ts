import { describe, it, expect } from "vitest";
import { toNotificationDraftErrors } from "~/features/notifications/api/contracts/notification-form-errors";
describe("通知フォームのAPI validation変換", () => {
  it("実APIの先頭キーと未知のエラーを欠落させず表示する", () => {
    expect(
      toNotificationDraftErrors({
        fieldErrors: {
          content: ["タイトルが長すぎます", "本文が不正です"],
          audience: ["対象が不正です"],
          delivery: ["未来日時を指定してください"],
          importance: ["許可されていません"],
          schedule: ["予約が不正です"],
          unknown: ["別の検証エラー"],
        },
        formErrors: ["フォーム全体のエラー"],
      })
    ).toEqual({
      fieldErrors: {
        audiences: "対象が不正です",
        scheduledAt: "未来日時を指定してください",
        importance: "許可されていません",
      },
      formErrors: [
        "フォーム全体のエラー",
        "通知内容: タイトルが長すぎます",
        "通知内容: 本文が不正です",
        "通知対象・配信日時: 予約が不正です",
        "別の検証エラー",
      ],
    });
  });
  it("詳細なキーも既存の入力欄へ対応させる", () => {
    expect(
      toNotificationDraftErrors({
        fieldErrors: { "content.detail.title": ["詳細タイトルが不正です"] },
        formErrors: [],
      }).fieldErrors.detailTitle
    ).toBe("詳細タイトルが不正です");
  });
});
