import { describe, expect, it } from "vitest";

import { getLegacyDestination } from "./get-legacy-destination";

describe("getLegacyDestination", () => {
  it.each([
    ["/sports", "/events"],
    ["/sports/new", "/events/new"],
    ["/sports/assignments", "/events"],
    ["/sports/42/edit", "/events/42/edit"],
  ])("redirects the old sports URL %s to %s", (pathname, destination) => {
    expect(getLegacyDestination(pathname)).toBe(destination);
  });

  it.each([
    ["/events/active", "/events"],
    ["/events/past", "/events"],
    ["/events/tournament", "/events"],
    ["/events/scoring", "/events"],
    ["/teachers/42", "/teachers/42/edit"],
    ["/user/settings", "/dashboard"],
    ["/timing", "/dashboard"],
    ["/reports/summary", "/dashboard"],
    ["/settings", "/dashboard"],
  ])(
    "keeps unsupported legacy URLs out of placeholder screens",
    (pathname, destination) => {
      expect(getLegacyDestination(pathname)).toBe(destination);
    }
  );

  it.each(["/events/assignments", "/participants"])(
    "削除済みの旧出場メンバー画面 %s はダッシュボードへ戻す",
    (pathname) => {
      expect(getLegacyDestination(pathname)).toBe("/dashboard");
    }
  );
});
