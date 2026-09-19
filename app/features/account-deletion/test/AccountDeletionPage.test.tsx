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
  document
    .querySelectorAll("link[data-test-account-deletion-favicon]")
    .forEach((link) => link.remove());
  mocks.startAccountDeletionAuth.mockReset();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/account-deletion"]}>
      <AccountDeletionPage gateway={testGateway} />
    </MemoryRouter>
  );
}

function addDefaultFavicon() {
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = "/recwatch-logo.svg";
  favicon.type = "image/svg+xml";
  favicon.sizes = "any";
  favicon.dataset.testAccountDeletionFavicon = "true";
  document.head.append(favicon);
  return favicon;
}

describe("AccountDeletionPage", () => {
  it("未ログインでも公開ページを表示し、Microsoft アカウント自体は対象外と説明する", () => {
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
      screen.queryByText("Microsoft アカウントが削除されることはありません。")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("削除される情報")).not.toBeInTheDocument();
    expect(screen.queryByText("お問い合わせ")).not.toBeInTheDocument();

    const microsoftButton = screen.getByRole("button", {
      name: "Microsoft アカウントで認証する",
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

  it("アカウント未登録エラーを本人確認開始ページに表示する", () => {
    render(
      <MemoryRouter
        initialEntries={["/account-deletion?error=account_not_found"]}
      >
        <AccountDeletionPage
          gateway={testGateway}
          initialError="account_not_found"
        />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "このMicrosoft アカウントに対応するアカウントは存在しません。"
      )
    ).toBeInTheDocument();
  });

  it("Safari向けのスクロール設定を表示中だけ適用し、終了時に戻す", () => {
    const { unmount } = renderPage();

    expect(screen.getByRole("main")).toHaveClass(
      "account-deletion-viewport",
      "min-h-screen",
      "min-h-dvh"
    );
    expect(document.documentElement.style.background).toBe(
      "rgb(255, 255, 255)"
    );
    expect(document.body.style.height).toBe("auto");
    expect(document.body.style.overflowY).toBe("auto");
    expect(document.body.style.background).toBe("transparent");

    unmount();

    expect(document.documentElement.style.background).toBe("");
    expect(document.body.style.height).toBe("");
    expect(document.body.style.overflowY).toBe("");
    expect(document.body.style.background).toBe("");
  });

  it("表示中だけfaviconをRE:CREATIONへ切り替え、終了時に戻す", () => {
    const favicon = addDefaultFavicon();
    const { unmount } = renderPage();

    expect(favicon.getAttribute("href")).toBe("/recreation-favicon.svg");

    unmount();

    expect(favicon.getAttribute("href")).toBe("/recwatch-logo.svg");
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
      name: "Microsoft アカウントで認証する",
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
