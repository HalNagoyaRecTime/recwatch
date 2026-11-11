import { describe, expect, it } from "vitest";

import {
  buildNavigationSearchResults,
  filterNavigationSearchResults,
} from "~/features/frame/main-header/search/model/navigation-search";

const VALID_DESTINATIONS = new Set([
  "/dashboard",
  "/events",
  "/events/new",
  "/events/today",
  "/notifications",
  "/notifications/new",
  "/students",
  "/teachers",
  "/teams",
  "/ranking",
  "/classrooms",
  "/classrooms/new",
  "/gathering-spots",
  "/venues",
]);

describe("navigation search", () => {
  it("uses only destinations registered in the current route tree", () => {
    const results = buildNavigationSearchResults("admin");

    expect(results.every((result) => VALID_DESTINATIONS.has(result.to))).toBe(
      true
    );
    expect(results).toContainEqual(
      expect.objectContaining({ title: "クラス管理", to: "/classrooms" })
    );
    expect(results).toContainEqual(
      expect.objectContaining({
        title: "クラスの新規登録",
        to: "/classrooms/new",
      })
    );
    expect(results).not.toContainEqual(
      expect.objectContaining({ to: "/classroom" })
    );
  });

  it("keeps Sidebar-hidden destinations searchable", () => {
    const results = buildNavigationSearchResults("admin");

    expect(results).toContainEqual(
      expect.objectContaining({ to: "/events/new" })
    );
    expect(results).toContainEqual(
      expect.objectContaining({ to: "/notifications/new" })
    );
  });

  it("filters by Japanese labels, categories, and keywords", () => {
    expect(filterNavigationSearchResults("教官")).toContainEqual(
      expect.objectContaining({ title: "教官管理", to: "/teachers" })
    );
    expect(filterNavigationSearchResults("CSV")).toEqual([
      expect.objectContaining({ title: "学生管理", to: "/students" }),
    ]);
  });

  it("returns the full result set for a blank query", () => {
    const results = buildNavigationSearchResults("admin");
    expect(filterNavigationSearchResults("  ", results)).toEqual(results);
  });
});
