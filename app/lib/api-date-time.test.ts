import { describe, expect, it } from "vitest";

import { toUtcIsoDateTime } from "~/lib/api-date-time";

describe("toUtcIsoDateTime", () => {
  it("タイムゾーンなしの日時をUTCとして解釈する", () => {
    expect(toUtcIsoDateTime("2026-10-16 12:20:58")).toBe(
      "2026-10-16T12:20:58.000Z"
    );
    expect(toUtcIsoDateTime("2026-10-16T12:20:58")).toBe(
      "2026-10-16T12:20:58.000Z"
    );
    expect(toUtcIsoDateTime("2026-10-16 12:20")).toBe(
      "2026-10-16T12:20:00.000Z"
    );
  });

  it("タイムゾーンつきの日時はそのままの時刻で揃える", () => {
    expect(toUtcIsoDateTime("2026-10-16T12:20:58Z")).toBe(
      "2026-10-16T12:20:58.000Z"
    );
    expect(toUtcIsoDateTime("2026-10-16T21:20:58+09:00")).toBe(
      "2026-10-16T12:20:58.000Z"
    );
  });

  it("解釈できない値はそのまま返す", () => {
    expect(toUtcIsoDateTime("")).toBe("");
    expect(toUtcIsoDateTime("not-a-date")).toBe("not-a-date");
  });
});
