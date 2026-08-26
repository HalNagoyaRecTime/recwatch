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
  it("通常リンクは未指定の親パスを前方一致で選択しない", () => {
    expect(isSidebarItemActive(item({}), "/notifications/new")).toBe(false);
  });

  it("通知管理は詳細・編集・新規登録画面でも選択する", () => {
    const notificationManagement = item({
      activePatterns: [
        "/notifications",
        "/notifications/new",
        "/notifications/:notificationId",
        "/notifications/:notificationId/edit",
      ],
    });

    expect(
      isSidebarItemActive(notificationManagement, "/notifications/123")
    ).toBe(true);
    expect(
      isSidebarItemActive(notificationManagement, "/notifications/123/edit")
    ).toBe(true);
    expect(
      isSidebarItemActive(notificationManagement, "/notifications/new")
    ).toBe(true);
  });

  it("イベント登録一覧の派生ページだけを明示パターンで選択する", () => {
    const eventsList = item({
      id: "events-list",
      label: "イベント登録一覧",
      to: "/events",
      activePatterns: [
        "/events",
        "/events/new",
        "/events/active",
        "/events/past",
        "/events/tournament",
        "/events/scoring",
        "/events/:competitionId/edit",
      ],
    });

    for (const pathname of [
      "/events/active",
      "/events/past",
      "/events/tournament",
      "/events/scoring",
      "/events/competition-1/edit",
    ]) {
      expect(isSidebarItemActive(eventsList, pathname)).toBe(true);
    }

    expect(isSidebarItemActive(eventsList, "/events/new")).toBe(true);
    expect(isSidebarItemActive(eventsList, "/events/assignments")).toBe(false);
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

  it("表示されないインポート画面はユーザー親をフォールバック選択する", () => {
    const members = item({
      id: "members",
      label: "ユーザー",
      to: undefined,
      activePatterns: ["/members/import"],
      children: [
        item({
          id: "members-list",
          label: "学生管理",
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
          activePatterns: ["/notifications", "/notifications/new"],
          id: "notification-management",
          label: "通知管理",
          to: "/notifications",
        }),
      ],
    });

    expect(isSidebarItemActive(schedule, "/notifications/new")).toBe(true);
  });
});
