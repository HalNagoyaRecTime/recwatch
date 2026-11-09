import { describe, expect, it } from "vitest";
import { formatNotificationDeliveryFailure } from "~/features/notifications/components/detail/notification-detail-display";

describe("配信失敗理由の表示", () => {
  it.each([
    ["UNREGISTERED", "通知先端末の登録が無効です"],
    ["INVALID_ARGUMENT", "通知の送信情報が正しくありません"],
    ["SENDER_ID_MISMATCH", "通知の送信元と通知先端末の登録情報が一致しません"],
    ["QUOTA_EXCEEDED", "通知の送信上限を超えています"],
    ["INTERNAL", "通知サービスで内部エラーが発生しました"],
    ["UNAVAILABLE", "通知サービスを一時的に利用できません"],
  ])("既知のコード%sだけを日本語にする", (code, expected) => {
    expect(formatNotificationDeliveryFailure(code)).toBe(expected);
  });

  it("失敗理由がない場合は既存の未設定表示にする", () => {
    expect(formatNotificationDeliveryFailure(null)).toBe("—");
  });

  it.each([
    "UNKNOWN_ERROR",
    "通知の送信に失敗しました",
    "UNAVAILABLE: additional details",
    " UNAVAILABLE ",
    "unavailable",
    "constructor",
    "",
  ])("完全一致しない理由%jは原文を保持する", (reason) => {
    expect(formatNotificationDeliveryFailure(reason)).toBe(reason);
  });
});
