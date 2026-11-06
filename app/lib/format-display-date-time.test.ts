import { describe, expect, it } from "vitest";

import { formatDisplayDateTime } from "~/lib/format-display-date-time";

describe("formatDisplayDateTime", () => {
  it("端末のタイムゾーンによらず日本時間で表示する", () => {
    expect(formatDisplayDateTime("2026-10-16T12:20:58.000Z")).toBe(
      "10/16 21:20"
    );
    expect(formatDisplayDateTime("2026-10-16T15:30:00.000Z")).toBe(
      "10/17 00:30"
    );
  });

  it("解釈できない値は代わりの記号を表示する", () => {
    expect(formatDisplayDateTime("not-a-date")).toBe("—");
  });
});
