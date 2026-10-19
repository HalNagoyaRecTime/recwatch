import { describe, expect, it } from "vitest";

import { parsePositiveIntegerRouteParam } from "~/lib/parse-positive-integer-route-param";

describe("parsePositiveIntegerRouteParam", () => {
  it("positive decimal integerだけを受け付ける", () => {
    expect(parsePositiveIntegerRouteParam("42")).toBe(42);
    expect(parsePositiveIntegerRouteParam("01")).toBe(1);
  });

  it.each([undefined, "", "0", "-1", "abc", "1.5", "1e2"])(
    "%sを不正値として扱う",
    (value) => {
      expect(parsePositiveIntegerRouteParam(value)).toBeNull();
    }
  );
});
