import { describe, it, expect } from "vitest";
import { toNotificationFormErrors } from "~/features/notifications/hooks/notification-form-errors";
describe("通知フォームのAPI validation変換", () => {
  it("実APIの先頭キーと未知のエラーを欠落させず表示する", () => {
    expect(
      toNotificationFormErrors({
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
        audiences: { kind: "api", message: "対象が不正です" },
        scheduledAt: { kind: "api", message: "未来日時を指定してください" },
        importance: { kind: "api", message: "許可されていません" },
      },
      formErrors: [
        { field: null, message: "フォーム全体のエラー" },
        { field: "content", message: "タイトルが長すぎます" },
        { field: "content", message: "本文が不正です" },
        { field: "schedule", message: "予約が不正です" },
        { field: "unknown", message: "別の検証エラー" },
      ],
    });
  });
  it("詳細なキーも既存の入力欄へ対応させる", () => {
    expect(
      toNotificationFormErrors({
        fieldErrors: { "content.detail.title": ["詳細タイトルが不正です"] },
        formErrors: [],
      }).fieldErrors.detailTitle
    ).toEqual({ kind: "api", message: "詳細タイトルが不正です" });
  });
});
