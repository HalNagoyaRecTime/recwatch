import { describe, expect, it } from "vitest";

import { buildSidebarMenu } from "./build-sidebar-menu";

describe("buildSidebarMenu", () => {
  it("管理者には実装済みの主要画面だけを案内する", () => {
    const paths = buildSidebarMenu("admin").flatMap((section) =>
      section.items.flatMap((item) => [
        item.to,
        ...(item.children?.map((child) => child.to) ?? []),
      ])
    );

    expect(paths).toEqual(
      expect.arrayContaining([
        "/dashboard",
        "/members",
        "/classroom",
        "/teachers",
        "/events",
        "/events/assignments",
        "/gathering-spots",
        "/schedule",
        "/participants",
        "/notifications",
      ])
    );
    expect(paths).not.toContain("/members/import");
    expect(paths).not.toContain("/events/new");
    expect(paths).not.toContain("/notifications/new");

    const labels = buildSidebarMenu("admin").flatMap((section) =>
      section.items.flatMap((item) => [
        item.label,
        ...(item.children?.map((child) => child.label) ?? []),
      ])
    );
    expect(labels).toEqual(
      expect.arrayContaining([
        "ユーザー管理",
        "学生管理",
        "クラス管理",
        "教官管理",
        "イベント管理",
        "イベント登録一覧",
        "参加者設定",
        "集合場所管理",
        "運用管理",
        "スケジュール管理",
        "出場メンバー管理",
        "通知一覧",
      ])
    );
    expect(labels).not.toContain("メンバー");
    expect(labels).not.toContain("ユーザー");
    expect(labels).not.toContain("クラス一覧");
    expect(labels).not.toContain("イベントマスター");
    expect(labels).not.toContain("スケジュール");
    expect(labels).not.toContain("新規登録");

    expect(
      buildSidebarMenu("admin")
        .slice(1)
        .every((section) => !section.label)
    ).toBe(true);

    const classRoomItem = buildSidebarMenu("admin")
      .flatMap((section) => section.items)
      .flatMap((item) => item.children ?? [])
      .find((item) => item.to === "/classroom");
    expect(classRoomItem?.icon).toBeUndefined();
  });

  it("運用管理者には管理画面を表示する", () => {
    const labels = getLabels("manager");

    expect(labels).toEqual(
      expect.arrayContaining([
        "ユーザー管理",
        "教官管理",
        "イベント管理",
        "参加者設定",
        "運用管理",
        "通知一覧",
      ])
    );
  });

  it("一般利用者には許可された画面だけを表示する", () => {
    const labels = getLabels("member");

    expect(labels).toEqual(["ダッシュボード", "運用管理", "スケジュール管理"]);
    expect(labels).not.toEqual(
      expect.arrayContaining([
        "ユーザー管理",
        "教官管理",
        "イベント管理",
        "参加者設定",
        "出場メンバー管理",
        "通知一覧",
      ])
    );
  });
});

function getLabels(role: "admin" | "manager" | "member") {
  return buildSidebarMenu(role).flatMap((section) =>
    section.items.flatMap((item) => [
      item.label,
      ...(item.children?.map((child) => child.label) ?? []),
    ])
  );
}
