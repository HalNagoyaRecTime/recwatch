import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";

import AccountDeletionRoute from "./account-deletion";

afterEach(() => {
  cleanup();
});

describe("account-deletion route", () => {
  it("クエリのアカウント未登録エラーをボタンの下で通知する", () => {
    render(
      <MemoryRouter
        initialEntries={["/account-deletion?error=account_not_found"]}
      >
        <Routes>
          <Route path="/account-deletion" element={<AccountDeletionRoute />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "このMicrosoft アカウントに対応するアカウントは存在しません。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Microsoft アカウントで認証する",
      })
    ).toBeInTheDocument();
    const error = screen.getByRole("alert");
    const button = screen.getByRole("button", {
      name: "Microsoft アカウントで認証する",
    });
    expect(error).toHaveTextContent(
      "このMicrosoft アカウントに対応するアカウントは存在しません。"
    );
    expect(button.compareDocumentPosition(error)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
