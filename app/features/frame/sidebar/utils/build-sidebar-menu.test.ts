import { describe, expect, it } from "vitest";

import { buildSidebarMenu } from "./build-sidebar-menu";

describe("buildSidebarMenu", () => {
  it("管理者には画像のサイドメニュー構成で画面を案内する", () => {
    const paths = buildSidebarMenu("admin").flatMap((section) =>
      section.items.flatMap((item) => [
        item.to,
        ...(item.children?.map((child) => child.to) ?? []),
      ])
    );

    expect(paths).toEqual(
      expect.arrayContaining([
        "/dashboard",
        "/students",
        "/classroom",
        "/teachers",
        "/events",
        "/events/today",
        "/notifications",
        "/schedule",
        "/teams",
        "/ranking",
        "/events/assignments",
        "/gathering-spots",
        "/participants",
        "/members",
      ])
    );
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
        "イベント",
        "イベント一覧",
        "本日の進行",
        "通知",
        "スケジュール",
        "チーム",
        "ランキング",
        "ユーザー",
        "学生",
        "教官",
        "クラス",
        "参加者設定",
        "集合場所管理",
        "出場メンバー管理",
        "旧学生管理",
      ])
    );
    expect(labels).not.toContain("ユーザー管理");
    expect(labels).not.toContain("イベント管理");
    expect(labels).not.toContain("運用管理");
    expect(labels).not.toContain("スケジュール管理");

    expect(
      buildSidebarMenu("admin")
        .slice(1)
        .map((section) => section.label)
    ).toEqual(["運用", "チーム・成績", "管理", "削除予定"]);

    const operationSection = buildSidebarMenu("admin").find(
      (section) => section.label === "運用"
    );
    const deletionSection = buildSidebarMenu("admin").find(
      (section) => section.label === "削除予定"
    );
    expect(operationSection?.items.map((item) => item.label)).not.toContain(
      "スケジュール"
    );
    expect(deletionSection?.items.map((item) => item.label)).toContain(
      "スケジュール"
    );

    const classRoomItem = buildSidebarMenu("admin")
      .flatMap((section) => section.items)
      .find((item) => item.to === "/classroom");
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
  return buildSidebarMenu(role).flatMap((section) =>
    section.items.flatMap((item) => [
      item.label,
      ...(item.children?.map((child) => child.label) ?? []),
    ])
  );
}
