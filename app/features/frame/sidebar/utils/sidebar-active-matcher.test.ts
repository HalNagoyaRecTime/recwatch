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
