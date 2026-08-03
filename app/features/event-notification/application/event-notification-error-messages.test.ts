import { describe, expect, it } from "vitest";

import { EventNotificationError } from "./event-notification-error";
import { getEventNotificationErrorMessage } from "./event-notification-error-messages";

describe("getEventNotificationErrorMessage", () => {
  it("操作ごとに適切なメッセージへ変換する", () => {
    const error = new EventNotificationError("conflict");

    expect(getEventNotificationErrorMessage(error, "list")).toContain(
      "再読み込み"
    );
    expect(getEventNotificationErrorMessage(error, "notification")).toContain(
      "イベントまたは通知"
    );
  });

  it("型が不明なエラーは予期しないエラーへフォールバックする", () => {
    expect(
      getEventNotificationErrorMessage(new Error("Request failed"), "detail")
    ).toBe("イベントの詳細を取得できませんでした。");
  });
});
