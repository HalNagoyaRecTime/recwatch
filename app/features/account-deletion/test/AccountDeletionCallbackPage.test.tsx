import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import type { AccountDeletionGateway } from "../api/contracts/account-deletion-gateway";
import {
  getAccessToken,
  setAccessToken,
} from "~/features/auth/lib/accessTokenStore";
import {
  getRefreshTokenId,
  setRefreshTokenId,
} from "~/features/auth/lib/refreshTokenStore";

const mocks = vi.hoisted(() => ({
  confirmAccountDeletion: vi.fn(),
}));

const testGateway: AccountDeletionGateway = {
  startAuth: vi.fn(),
  confirm: mocks.confirmAccountDeletion,
};

import { AccountDeletionCallbackPage } from "../pages/AccountDeletionCallbackPage";

afterEach(() => {
  cleanup();
  mocks.confirmAccountDeletion.mockReset();
  setAccessToken(null);
  setRefreshTokenId(null);
  window.localStorage.clear();
  window.sessionStorage.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/account-deletion/callback"]}>
      <Routes>
        <Route
          path="/account-deletion/callback"
          element={
            <AccountDeletionCallbackPage
              data={{
                status: "confirm",
                deletionConfirmationToken: "deletion-token",
              }}
              gateway={testGateway}
            />
          }
        />
        <Route path="/account-deletion" element={<p>アカウント削除ページ</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function confirmDeletion() {
  fireEvent.click(screen.getByRole("button", { name: "アカウントを削除する" }));
  const dialog = screen.getByRole("dialog");
  const confirmButton = within(dialog).getByRole("button", {
    name: "削除する",
  });
  fireEvent.click(confirmButton);
  return { confirmButton, dialog };
}

describe("AccountDeletionCallbackPage", () => {
  it("本人確認後に最終確認を表示し、削除送信中は多重送信を防ぎ、通常ログイン情報を保持する", async () => {
    setAccessToken("existing-access-token");
    setRefreshTokenId("existing-refresh-id");

    let resolveDeletion: (value: { status: "done" }) => void = () => {};
    mocks.confirmAccountDeletion.mockReturnValue(
      new Promise((resolve) => {
        resolveDeletion = resolve;
      })
    );

    renderPage();
    expect(screen.getByText("RE:CREATION")).toBeInTheDocument();
    expect(screen.queryByText(/recwatch/i)).not.toBeInTheDocument();
    expect(screen.getByText("Produced by HAL Nagoya")).toBeInTheDocument();
    expect(
      screen.getByText("Developed by RE:CREATION Development Team")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "アカウントを削除",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("確認事項")).toBeInTheDocument();
    expect(screen.getByText("この操作は取り消せません。")).toBeInTheDocument();
    expect(
      screen.getByText("Microsoft アカウントが削除されることはありません。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "キャンセル" })
    ).toBeInTheDocument();

    const { confirmButton, dialog } = confirmDeletion();
    fireEvent.click(confirmButton);

    expect(mocks.confirmAccountDeletion).toHaveBeenCalledTimes(1);
    expect(mocks.confirmAccountDeletion).toHaveBeenCalledWith("deletion-token");
    expect(confirmButton).toBeDisabled();
    expect(
      within(dialog).getByRole("heading", {
        name: "本当にアカウントを削除しますか？",
      })
    ).toBeInTheDocument();

    resolveDeletion({ status: "done" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "削除が完了しました" })
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByText("このアカウントでは利用できません。")
    ).not.toBeInTheDocument();
    expect(getAccessToken()).toBe("existing-access-token");
    expect(getRefreshTokenId()).toBe("existing-refresh-id");
  });

  it("確認モーダルでキャンセルすると削除APIを呼ばない", () => {
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "アカウントを削除する" })
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "とじる" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.confirmAccountDeletion).not.toHaveBeenCalled();
  });

  it("削除せず終了すると削除APIを呼ばずアカウント削除ページへ戻る", async () => {
    window.sessionStorage.setItem("rectime_deletion_auth_pending", "1");
    window.sessionStorage.setItem(
      "rectime_deletion_auth_result",
      JSON.stringify({
        status: "confirmed",
        token: "deletion-token",
      })
    );

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(await screen.findByText("アカウント削除ページ")).toBeInTheDocument();
    expect(mocks.confirmAccountDeletion).not.toHaveBeenCalled();
    expect(
      window.sessionStorage.getItem("rectime_deletion_auth_pending")
    ).toBeNull();
    expect(
      window.sessionStorage.getItem("rectime_deletion_auth_result")
    ).toBeNull();
  });

  it("すでに削除済みの場合は完了案内を表示する", async () => {
    mocks.confirmAccountDeletion.mockResolvedValue({
      status: "error",
      code: "ACCOUNT_ALREADY_PURGED",
      message: "削除処理はすでに完了しています。",
      reason: "generic",
    });

    renderPage();
    confirmDeletion();

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "削除処理は完了しています" })
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByText("このアカウントでは利用できません。")
    ).not.toBeInTheDocument();
  });

  it("Token無効時は認証からやり直せる", async () => {
    mocks.confirmAccountDeletion.mockResolvedValue({
      status: "error",
      code: "DELETION_CONFIRMATION_TOKEN_INVALID",
      message:
        "Microsoft アカウントの認証情報が無効か、有効期限が切れている可能性があります。もう一度認証してください。",
      reason: "reauth",
    });

    renderPage();
    confirmDeletion();

    await waitFor(() =>
      expect(
        screen.getByText(
          "Microsoft アカウントの認証情報が無効か、有効期限が切れている可能性があります。もう一度認証してください。"
        )
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole("link", {
        name: "アカウント削除ページに戻る",
      })
    ).toHaveAttribute("href", "/account-deletion");
  });

  it("サーバーエラーでは重複した説明を表示せず、削除受付ページへ戻れる", () => {
    render(
      <MemoryRouter>
        <AccountDeletionCallbackPage
          data={{
            status: "error",
            message:
              "削除受付サービスでエラーが発生しました。時間をおいてもう一度お試しください。",
            reason: "generic",
          }}
          gateway={testGateway}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "サーバーでエラーが発生しました" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "削除受付サービスでエラーが発生しました。時間をおいてもう一度お試しください。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "アカウント削除ページに戻る" })
    ).toHaveAttribute("href", "/account-deletion");
  });
});
