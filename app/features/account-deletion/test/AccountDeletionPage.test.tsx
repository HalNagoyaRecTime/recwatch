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
  it("未ログインでも公開ページを表示し、Microsoftアカウント自体は対象外と説明する", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "アカウントを削除",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("RE:CREATION")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "アカウントを削除",
      })
    ).toHaveClass("text-[#333333]");
    expect(screen.getByText("アカウントの削除手続きを行います。")).toHaveClass(
      "max-w-md",
      "text-center"
    );
    expect(screen.queryByText(/recwatch/i)).not.toBeInTheDocument();
    expect(screen.getByText("Produced by HAL Nagoya")).toBeInTheDocument();
    expect(
      screen.getByText("Developed by RE:CREATION Development Team")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Microsoft アカウントが削除されることはありません。")
    ).toBeInTheDocument();
    expect(screen.queryByText("削除される情報")).not.toBeInTheDocument();
    expect(screen.queryByText("お問い合わせ")).not.toBeInTheDocument();

    const microsoftButton = screen.getByRole("button", {
      name: "Microsoftアカウントで本人確認する",
    });
    expect(microsoftButton).toBeInTheDocument();
    expect(microsoftButton).toHaveClass(
      "h-12",
      "bg-[#333333]",
      "font-medium",
      "rounded-sm"
    );

    expect(microsoftButton.querySelector("svg")).toHaveClass("h-4.5", "w-4.5");
    expect(microsoftButton.querySelectorAll("rect")).toHaveLength(4);
  });

  it("dark祖先でもライトテーマの背景を維持する", () => {
    render(
      <div className="dark">
        <AccountDeletionPage gateway={testGateway} />
      </div>
    );

    const main = screen.getByRole("main");
    expect(main).toHaveClass("bg-white");
    expect(main.getAttribute("style")).toContain("--text-base");
    expect(main.getAttribute("style")).toContain("#333333");
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
        name: "アカウントを削除",
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
      name: "Microsoftアカウントで本人確認する",
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
