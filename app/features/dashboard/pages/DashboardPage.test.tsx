import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";

import { DashboardPage } from "./DashboardPage";

afterEach(cleanup);

describe("DashboardPage", () => {
  it("「ようこそ」とログイン中ユーザー名を2行で表示する", () => {
    render(
      <MemoryRouter>
        <DashboardPage userName="山田太郎" />
      </MemoryRouter>
    );

    expect(screen.getByText("ようこそ")).toBeInTheDocument();
    expect(screen.getByText("山田太郎さん")).toBeInTheDocument();
  });

  it("「ダッシュボード」の見出しやナビゲーションを表示しない", () => {
    render(
      <MemoryRouter>
        <DashboardPage userName="山田太郎" />
      </MemoryRouter>
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText("ダッシュボード")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("ユーザー名が未取得の場合はフォールバックの文言を表示する", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText("ようこそ")).toBeInTheDocument();
    expect(screen.getByText("ユーザーさん")).toBeInTheDocument();
  });

  it("API接続エラーを操作を妨げない通知として表示する", () => {
    render(
      <MemoryRouter>
        <DashboardPage
          userName="山田太郎"
          connectionError="APIに接続できません"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("APIに接続できません");
  });
});
