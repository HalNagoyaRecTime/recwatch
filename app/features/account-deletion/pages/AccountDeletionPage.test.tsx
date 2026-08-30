import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

const mocks = vi.hoisted(() => ({
  startAccountDeletionAuth: vi.fn(),
}));

vi.mock("~/features/account-deletion/api/account-deletion-client", () => ({
  startAccountDeletionAuth: mocks.startAccountDeletionAuth,
}));

const { startAccountDeletionAuth } = mocks;

import { AccountDeletionPage } from "./AccountDeletionPage";

afterEach(() => {
  cleanup();
  startAccountDeletionAuth.mockReset();
});

function renderPage(initialEntries = ["/account-deletion"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AccountDeletionPage />
    </MemoryRouter>
  );
}

describe("AccountDeletionPage", () => {
  it("未ログインでも直接表示できる", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "RE:CREATIONアカウントの削除",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Microsoftアカウントで本人確認して削除を進める/,
      })
    ).toBeInTheDocument();
  });

  it("URLに任意のuserId/メールアドレスが付いていても無視して表示する", () => {
    renderPage(["/account-deletion?userId=123&email=someone@example.com"]);

    expect(startAccountDeletionAuth).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "RE:CREATIONアカウントの削除",
      })
    ).toBeInTheDocument();
  });

  it("ボタン押下でMicrosoft確認への遷移を開始し、完了まで多重送信を防ぐ", async () => {
    let resolveAuth: (value: { ok: true; authUrl: string }) => void = () => {};
    startAccountDeletionAuth.mockReturnValue(
      new Promise((resolve) => {
        resolveAuth = resolve;
      })
    );

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });

    renderPage();
    const button = screen.getByRole("button", {
      name: /Microsoftアカウントで本人確認して削除を進める/,
    });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(startAccountDeletionAuth).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    resolveAuth({
      ok: true,
      authUrl: "/account-deletion/callback?state=mock-state",
    });

    await waitFor(() =>
      expect(window.location.href).toBe(
        "/account-deletion/callback?state=mock-state"
      )
    );

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("開始に失敗した場合はエラーを表示し、再送信できる状態に戻す", async () => {
    startAccountDeletionAuth.mockResolvedValue({
      ok: false,
      message: "テスト用のエラーメッセージ",
    });

    renderPage();
    const button = screen.getByRole("button", {
      name: /Microsoftアカウントで本人確認して削除を進める/,
    });

    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByText("テスト用のエラーメッセージ")).toBeInTheDocument()
    );
    expect(button).not.toBeDisabled();
  });
});
