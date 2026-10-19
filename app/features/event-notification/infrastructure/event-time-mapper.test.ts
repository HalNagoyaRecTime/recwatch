import { describe, expect, it } from "vitest";

import { EventNotificationError } from "../application/event-notification-error";
import { toApiTime, toDisplayTime } from "./event-time-mapper";

describe("event time mapper", () => {
  it("画面のHH:mmをAPIのHHMMへ変換する", () => {
    expect(toApiTime("09:10")).toBe("0910");
  });

  it("APIのHHMMを画面のHH:mmへ変換する", () => {
    expect(toDisplayTime("1745")).toBe("17:45");
  });

  it("不正な画面時刻を拒否する", () => {
    expect(() => toApiTime("9:10")).toThrow(
      new EventNotificationError("invalid_request")
    );
  });
});
