import { describe, expect, it } from "vitest";

import { isSidebarItemActive } from "~/features/frame/sidebar/utils/sidebar-active-matcher";
import type { SidebarItemDef } from "~/types/sidebar";

function item(overrides: Partial<SidebarItemDef>): SidebarItemDef {
  return {
    id: "notifications",
    label: "通知管理",
    roles: ["admin"],
    to: "/notifications",
    ...overrides,
  };
}

describe("isSidebarItemActive", () => {
  it("通常リンクは親パスの前方一致で選択しない", () => {
    expect(isSidebarItemActive(item({}), "/notifications/new")).toBe(false);
  });

  it("明示した動的パターンはID付きURLでも選択する", () => {
    const notificationManagement = item({
      activePatterns: [
        "/notifications",
        "/notifications/:notificationId",
        "/notifications/:notificationId/edit",
      ],
      activeExclusions: ["/notifications/new"],
    });

    expect(
      isSidebarItemActive(notificationManagement, "/notifications/123")
    ).toBe(true);
    expect(
      isSidebarItemActive(notificationManagement, "/notifications/123/edit")
    ).toBe(true);
    expect(
      isSidebarItemActive(notificationManagement, "/notifications/new")
    ).toBe(false);
  });

  it("競技一覧の派生ページを明示パターンで選択する", () => {
    const eventsList = item({
      id: "events-list",
      label: "競技一覧",
      to: "/events",
      activePatterns: [
        "/events",
        "/events/active",
        "/events/past",
        "/events/tournament",
        "/events/scoring",
        "/events/assignments",
        "/events/:competitionId/edit",
      ],
    });

    for (const pathname of [
      "/events/active",
      "/events/past",
      "/events/tournament",
      "/events/scoring",
      "/events/assignments",
      "/events/competition-1/edit",
    ]) {
      expect(isSidebarItemActive(eventsList, pathname)).toBe(true);
    }

    expect(isSidebarItemActive(eventsList, "/events/new")).toBe(false);
  });

  it("スケジュールの派生ページを親フォルダーで選択する", () => {
    const schedule = item({
      id: "schedule",
      label: "スケジュール",
      to: "/schedule",
      activePatterns: [
        "/schedule",
        "/schedule/new",
        "/schedule/:scheduleId/edit",
      ],
      children: [
        item({
          id: "notification-management",
          label: "通知管理",
          to: "/notifications",
        }),
      ],
    });

    expect(isSidebarItemActive(schedule, "/schedule/new")).toBe(true);
    expect(isSidebarItemActive(schedule, "/schedule/123/edit")).toBe(true);
  });

  it("表示されないインポート画面はメンバー親をフォールバック選択する", () => {
    const members = item({
      id: "members",
      label: "メンバー",
      to: undefined,
      activePatterns: ["/members/import"],
      children: [
        item({
          id: "members-list",
          label: "ユーザー管理",
          to: "/members",
        }),
      ],
    });

    expect(isSidebarItemActive(members, "/members/import")).toBe(true);
    expect(isSidebarItemActive(members.children![0], "/members/import")).toBe(
      false
    );
  });

  it("子ページがactiveなら親フォルダをactiveにする", () => {
    const schedule = item({
      id: "schedule",
      label: "スケジュール",
      to: undefined,
      children: [
        item({
          id: "notification-create",
          label: "通知作成",
          to: "/notifications/new",
        }),
      ],
    });

    expect(isSidebarItemActive(schedule, "/notifications/new")).toBe(true);
  });
});
