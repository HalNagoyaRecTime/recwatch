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
  accountDeletionUnavailableMessage:
    "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。",
  startAccountDeletionAuth: mocks.startAccountDeletionAuth,
}));

import { AccountDeletionPage } from "./AccountDeletionPage";

afterEach(() => {
  cleanup();
  mocks.startAccountDeletionAuth.mockReset();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/account-deletion"]}>
      <AccountDeletionPage />
    </MemoryRouter>
  );
}

describe("AccountDeletionPage", () => {
  it("未ログインでも公開ページを表示し、Microsoftアカウント自体は対象外と説明する", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "RecTimeアカウントの削除",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "この手続きで削除されるのは、RecTimeが管理するアカウントと関連データです。削除受付後はRecTimeを利用できなくなります。学校から付与されたMicrosoft 365アカウントそのものは削除されません。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Microsoftアカウントで本人確認を開始",
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
        <AccountDeletionPage />
      </MemoryRouter>
    );

    expect(mocks.startAccountDeletionAuth).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "RecTimeアカウントの削除",
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
      name: "Microsoftアカウントで本人確認を開始",
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
