import { describe, expect, it } from "vitest";

import {
  NAVIGATION_SEARCH_RESULTS,
  filterNavigationSearchResults,
} from "~/features/frame/main-header/search/constants/navigationSearchResults";

describe("navigation search results", () => {
  it("contains only real recwatch destinations", () => {
    expect(NAVIGATION_SEARCH_RESULTS).toContainEqual(
      expect.objectContaining({ title: "教官管理", to: "/teachers" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).toContainEqual(
      expect.objectContaining({ title: "ダッシュボード", to: "/dashboard" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).toContainEqual(
      expect.objectContaining({ title: "イベント登録一覧", to: "/events" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).toContainEqual(
      expect.objectContaining({ title: "通知管理", to: "/notifications" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Weekly product sync notes" }),
      ])
    );
  });

  it("filters destinations by Japanese title and keyword", () => {
    expect(filterNavigationSearchResults("教官")).toContainEqual(
      expect.objectContaining({ title: "教官管理", to: "/teachers" })
    );

    expect(filterNavigationSearchResults("CSV")).toEqual([
      expect.objectContaining({ title: "学生管理", to: "/members" }),
    ]);
  });

  it("returns all destinations for a blank query", () => {
    expect(filterNavigationSearchResults("  ")).toEqual(
      NAVIGATION_SEARCH_RESULTS
    );
  });
});
