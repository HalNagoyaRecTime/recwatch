import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";

import { AccountDeletionCallbackPage } from "./AccountDeletionCallbackPage";

afterEach(cleanup);

describe("AccountDeletionCallbackPage", () => {
  it("削除完了時に完了メッセージと固定の戻りリンクを表示する", () => {
    render(
      <MemoryRouter>
        <AccountDeletionCallbackPage data={{ status: "done" }} />
      </MemoryRouter>
    );

    expect(screen.getByText("削除を受け付けました")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "削除受付ページに戻る" })
    ).toHaveAttribute("href", "/account-deletion");
  });

  it("処理中の状態を表示する", () => {
    render(
      <MemoryRouter>
        <AccountDeletionCallbackPage data={{ status: "pending" }} />
      </MemoryRouter>
    );

    expect(screen.getByText("削除処理を受け付けました")).toBeInTheDocument();
  });

  it("エラー時にメッセージを表示する", () => {
    render(
      <MemoryRouter>
        <AccountDeletionCallbackPage
          data={{ status: "error", message: "テストエラー" }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("テストエラー")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "削除受付ページに戻る" })
    ).toHaveAttribute("href", "/account-deletion");
  });
});
