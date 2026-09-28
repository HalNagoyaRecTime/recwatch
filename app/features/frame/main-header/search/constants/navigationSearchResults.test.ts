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
      expect.objectContaining({ title: "通知一覧", to: "/notifications" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).not.toContainEqual(
      expect.objectContaining({ title: "通知管理", to: "/notifications" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Weekly product sync notes" }),
      ])
    );
  });

  it("旧出場メンバー画面を案内せず集合場所管理を維持する", () => {
    expect(NAVIGATION_SEARCH_RESULTS).not.toContainEqual(
      expect.objectContaining({ to: "/events/assignments" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).not.toContainEqual(
      expect.objectContaining({ to: "/participants" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).toContainEqual(
      expect.objectContaining({ title: "集合場所管理", to: "/gathering-spots" })
    );
    expect(NAVIGATION_SEARCH_RESULTS).toContainEqual(
      expect.objectContaining({ title: "実施場所管理", to: "/venues" })
    );
    expect(filterNavigationSearchResults("参加者設定")).toEqual([]);
    expect(filterNavigationSearchResults("出場メンバー管理")).toEqual([]);
  });

  it("filters destinations by Japanese title and keyword", () => {
    expect(filterNavigationSearchResults("教官")).toContainEqual(
      expect.objectContaining({ title: "教官管理", to: "/teachers" })
    );

    expect(filterNavigationSearchResults("CSV")).toEqual([
      expect.objectContaining({ title: "学生管理", to: "/students" }),
    ]);
  });

  it("returns all destinations for a blank query", () => {
    expect(filterNavigationSearchResults("  ")).toEqual(
      NAVIGATION_SEARCH_RESULTS
    );
  });
});
