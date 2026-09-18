import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import type { AccountDeletionGateway } from "../api/contracts/account-deletion-gateway";

const mocks = vi.hoisted(() => ({
  startAccountDeletionAuth: vi.fn(),
}));

const testGateway: AccountDeletionGateway = {
  startAuth: mocks.startAccountDeletionAuth,
  confirm: vi.fn(),
};

import { AccountDeletionPage } from "../pages/AccountDeletionPage";

afterEach(() => {
  cleanup();
  mocks.startAccountDeletionAuth.mockReset();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/account-deletion"]}>
      <AccountDeletionPage gateway={testGateway} />
    </MemoryRouter>
  );
}

describe("AccountDeletionPage", () => {
  it("未ログインでも公開ページを表示し、Microsoft 365アカウント自体は対象外と説明する", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "RecTimeアカウントを削除",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Microsoft 365アカウント自体が削除されることはありません。"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("削除される情報")).not.toBeInTheDocument();
    expect(screen.queryByText("お問い合わせ")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Microsoft 365で本人確認する",
      })
    ).toBeInTheDocument();
  });

  it("URLのuserIdやメールアドレスに依存せず表示する", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/account-deletion?userId=123&email=someone@example.com",
        ]}
      >
        <AccountDeletionPage gateway={testGateway} />
      </MemoryRouter>
    );

    expect(mocks.startAccountDeletionAuth).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "RecTimeアカウントを削除",
      })
    ).toBeInTheDocument();
  });

  it("Microsoft認証開始中は多重送信を防ぐ", async () => {
    let resolveAuth: (
      value: { ok: true; authUrl: string } | { ok: false; message: string }
    ) => void = () => {};
    mocks.startAccountDeletionAuth.mockReturnValue(
      new Promise((resolve) => {
        resolveAuth = resolve;
      })
    );

    renderPage();
    const button = screen.getByRole("button", {
      name: "Microsoft 365で本人確認する",
    });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(mocks.startAccountDeletionAuth).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    resolveAuth({
      ok: false,
      message: "認証開始に失敗しました。",
    });

    await waitFor(() =>
      expect(screen.getByText("認証開始に失敗しました。")).toBeInTheDocument()
    );
    expect(button).not.toBeDisabled();
  });
});
