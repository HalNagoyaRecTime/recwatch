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
  it("クラス管理は複数形の一覧URLで選択される", () => {
    const classrooms = item({
      id: "classrooms",
      label: "クラス管理",
      to: "/classrooms",
    });

    expect(isSidebarItemActive(classrooms, "/classrooms")).toBe(true);
    expect(isSidebarItemActive(classrooms, "/classroom")).toBe(false);
  });

  it("通常リンクは未指定の親パスを前方一致で選択しない", () => {
    expect(isSidebarItemActive(item({}), "/notifications/new")).toBe(false);
  });

  it("通知一覧は詳細・編集・新規登録画面でも選択する", () => {
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

  it("イベント一覧は現在のRouteを選択し、別項目の固定パスでは選択しない", () => {
    const eventsList = item({
      id: "events-list",
      label: "イベント一覧",
      to: "/events",
      activePatterns: [
        "/events",
        "/events/new",
        "/events/:eventId",
        "/events/:eventId/edit",
        "/events/:eventId/gatherings",
      ],
      activeExclusions: ["/events/today"],
    });

    expect(isSidebarItemActive(eventsList, "/events")).toBe(true);
    expect(isSidebarItemActive(eventsList, "/events/new")).toBe(true);
    expect(isSidebarItemActive(eventsList, "/events/12")).toBe(true);
    expect(isSidebarItemActive(eventsList, "/events/12/edit")).toBe(true);
    expect(isSidebarItemActive(eventsList, "/events/12/gatherings")).toBe(true);
    // `:eventId` に一致してしまう固定パスは除外で弾く
    expect(isSidebarItemActive(eventsList, "/events/today")).toBe(false);
  });

  it("イベント一覧の派生ページを親フォルダーで選択する", () => {
    const events = item({
      id: "events",
      label: "イベント",
      to: "/events",
      activePatterns: ["/events", "/events/new", "/events/:eventId/edit"],
      children: [
        item({
          id: "notification-management",
          label: "通知管理",
          to: "/notifications",
        }),
      ],
    });

    expect(isSidebarItemActive(events, "/events/new")).toBe(true);
    expect(isSidebarItemActive(events, "/events/123/edit")).toBe(true);
  });

  it("表示されないインポート画面はユーザー管理親をフォールバック選択する", () => {
    const userManagement = item({
      id: "user-management",
      label: "ユーザー管理",
      to: undefined,
      activePatterns: ["/students/import"],
      children: [
        item({
          id: "students-list",
          label: "学生管理",
          to: "/students",
        }),
      ],
    });

    expect(isSidebarItemActive(userManagement, "/students/import")).toBe(true);
    expect(
      isSidebarItemActive(userManagement.children![0], "/students/import")
    ).toBe(false);
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
          label: "通知一覧",
          to: "/notifications",
        }),
      ],
    });

    expect(isSidebarItemActive(schedule, "/notifications/new")).toBe(true);
  });
});
