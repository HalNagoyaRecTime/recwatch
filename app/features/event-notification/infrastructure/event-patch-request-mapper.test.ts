import { describe, expect, it } from "vitest";

import { EventNotificationError } from "../application/event-notification-error";
import { toPatchEventRequest } from "./event-patch-request-mapper";

describe("toPatchEventRequest", () => {
  it("変更するフィールドだけをsnake_caseへ変換する", () => {
    expect(
      toPatchEventRequest({
        eventId: 10,
        venue: " コートB ",
        startTime: "13:00",
        endTime: "13:30",
        notificationEnabled: false,
      })
    ).toEqual({
      venue: "コートB",
      start_time: "1300",
      end_time: "1330",
      notification_enabled: false,
    });
  });

  it("画面にない基本情報をRequestへ補完しない", () => {
    expect(
      toPatchEventRequest({
        eventId: 10,
        notificationEnabled: true,
      })
    ).toEqual({ notification_enabled: true });
  });

  it("空の更新を拒否する", () => {
    expect(() => toPatchEventRequest({ eventId: 10 })).toThrow(
      new EventNotificationError("invalid_request")
    );
  });

  it("開始・終了時刻を同時指定した場合は前後関係を検証する", () => {
    expect(() =>
      toPatchEventRequest({
        eventId: 10,
        startTime: "14:00",
        endTime: "13:00",
      })
    ).toThrow(new EventNotificationError("invalid_request"));
  });
});
