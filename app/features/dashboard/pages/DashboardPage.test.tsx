import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";

import { DashboardPage } from "./DashboardPage";

afterEach(cleanup);

describe("DashboardPage", () => {
  it("3つの管理領域を直接表示する", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "ダッシュボード" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "ユーザー管理" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "イベント管理" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "運用管理" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "通知管理" })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "イベント登録一覧" })
    ).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: "教官管理" })).toHaveAttribute(
      "href",
      "/teachers"
    );
    expect(
      screen.getByRole("link", { name: "出場メンバー管理" })
    ).toHaveAttribute("href", "/participants");
    expect(
      screen.queryByRole("heading", { level: 2, name: "クイック操作" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "管理メニュー" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "イベントの新規登録" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("学生情報の確認と編集")).not.toBeInTheDocument();
  });

  it("開発用の案内と自己リンクを表示しない", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.queryByText("ようこそ")).not.toBeInTheDocument();
    expect(
      screen.queryByText("現在登録されている画面へのリンク")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "ログイン" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "ダッシュボード" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("recwatchの管理機能へすばやくアクセスできます")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("よく使う登録・設定画面をすぐに開けます")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("管理する内容に合わせて画面を選択してください")
    ).not.toBeInTheDocument();
  });

  it("API接続エラーを操作を妨げない通知として表示する", () => {
    render(
      <MemoryRouter>
        <DashboardPage connectionError="APIに接続できません" />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("APIに接続できません");
  });
});
