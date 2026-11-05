import { describe, expect, it } from "vitest";

import { buildSidebarMenu } from "./build-sidebar-menu";
import { isSidebarItemActive } from "./sidebar-active-matcher";
import type { SidebarItemDef } from "~/types/sidebar";

describe("buildSidebarMenu", () => {
  it("管理者には画像のサイドメニュー構成で画面を案内する", () => {
    const menu = buildSidebarMenu("admin");
    const items = menu.flatMap((section) => flattenItems(section.items));
    const paths = items.map((item) => item.to);

    expect(paths).toEqual(
      expect.arrayContaining([
        "/dashboard",
        "/students",
        "/classrooms",
        "/teachers",
        "/events",
        "/notifications",
        "/teams",
        "/ranking",
        "/gathering-spots",
        "/venues",
      ])
    );
    expect(paths).not.toContain("/events/today");
    expect(paths).not.toContain("/schedule");
    expect(paths).not.toContain("/events/new");
    expect(paths).not.toContain("/notifications/new");
    expect(paths).not.toContain("/events/assignments");
    expect(paths).not.toContain("/participants");

    const labels = items.map((item) => item.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "イベント",
        "イベント一覧",
        "通知",
        "チーム",
        "ランキング",
        "ユーザー",
        "学生",
        "教官",
        "クラス",
        "集合場所管理",
        "実施場所管理",
      ])
    );
    expect(labels).not.toContain("本日の進行");
    expect(labels).not.toContain("場所");
    expect(labels).not.toContain("スケジュール");
    expect(labels).not.toContain("ユーザー管理");
    expect(labels).not.toContain("イベント管理");
    expect(labels).not.toContain("運用管理");
    expect(labels).not.toContain("スケジュール管理");
    expect(labels).not.toContain("参加者設定");
    expect(labels).not.toContain("出場メンバー管理");

    expect(menu.slice(1).map((section) => section.label)).toEqual([
      "運用",
      "チーム・成績",
      "管理",
    ]);

    const operationSection = menu.find((section) => section.label === "運用");
    expect(operationSection?.items.map((item) => item.label)).not.toContain(
      "スケジュール"
    );
    const events = operationSection?.items.find((item) => item.id === "events");
    expect(events?.children?.map((item) => item.label)).toEqual([
      "イベント一覧",
      "集合場所管理",
      "実施場所管理",
    ]);
    expect(events?.children?.map((item) => item.to)).toEqual([
      "/events",
      "/gathering-spots",
      "/venues",
    ]);
    if (!events?.children) {
      throw new Error("イベントメニューが見つかりません");
    }
    expect(isSidebarItemActive(events.children[1], "/gathering-spots")).toBe(
      true
    );
    expect(isSidebarItemActive(events.children[2], "/venues")).toBe(true);
    expect(isSidebarItemActive(events.children[1], "/venues")).toBe(false);

    const managementSection = menu.find((section) => section.label === "管理");
    expect(
      managementSection?.items.some((item) => item.id === "locations")
    ).toBe(false);
    expect(
      managementSection?.items.some((item) =>
        ["gathering-spots", "venues"].includes(item.id)
      )
    ).toBe(false);

    const classRoomItem = menu
      .flatMap((section) => section.items)
      .find((item) => item.to === "/classrooms");
    expect(classRoomItem?.icon).toBeDefined();
  });

  it("運用管理者には管理画面を表示する", () => {
    const labels = getLabels("manager");

    expect(labels).toEqual([]);
  });

  it("一般利用者には許可された画面だけを表示する", () => {
    const labels = getLabels("member");

    expect(labels).toEqual([]);
  });
});

function getLabels(role: "admin" | "manager" | "member") {
  return buildSidebarMenu(role)
    .flatMap((section) => flattenItems(section.items))
    .map((item) => item.label);
}

function flattenItems(items: SidebarItemDef[]): SidebarItemDef[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenItems(item.children) : []),
  ]);
}
