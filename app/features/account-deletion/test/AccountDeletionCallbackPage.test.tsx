import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import type { AccountDeletionGateway } from "../api/contracts/account-deletion-gateway";

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
        <Route path="/login" element={<p>ログインページ</p>} />
      </Routes>
    </MemoryRouter>
  );
}
describe("AccountDeletionCallbackPage", () => {
  it("本人確認後に最終確認を表示し、削除送信中は多重送信を防ぐ", async () => {
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
        name: "アカウントを削除しますか？",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "この操作は取り消せません。Microsoft 365アカウントには影響しません。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "削除せず終了する" })
    ).toBeInTheDocument();

    const button = screen.getByRole("button", {
      name: "RecTimeアカウントを削除する",
    });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(mocks.confirmAccountDeletion).toHaveBeenCalledTimes(1);
    expect(mocks.confirmAccountDeletion).toHaveBeenCalledWith("deletion-token");
    expect(button).toBeDisabled();

    resolveDeletion({ status: "done" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "削除を受け付けました" })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(
        "RecTimeアカウントの削除を受け付けました。このアカウントではRecTimeを利用できなくなります。"
      )
    ).toBeInTheDocument();
  });

  it("削除せず終了すると削除APIを呼ばずログイン画面へ戻る", async () => {
    window.sessionStorage.setItem("rectime_deletion_auth_pending", "1");
    window.sessionStorage.setItem(
      "rectime_deletion_auth_result",
      JSON.stringify({
        status: "confirmed",
        token: "deletion-token",
      })
    );

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "削除せず終了する" }));

    expect(await screen.findByText("ログインページ")).toBeInTheDocument();
    expect(mocks.confirmAccountDeletion).not.toHaveBeenCalled();
    expect(
      window.sessionStorage.getItem("rectime_deletion_auth_pending")
    ).toBeNull();
    expect(
      window.sessionStorage.getItem("rectime_deletion_auth_result")
    ).toBeNull();
  });

  it("Token無効時は本人確認からやり直せる", async () => {
    mocks.confirmAccountDeletion.mockResolvedValue({
      status: "error",
      code: "DELETION_CONFIRMATION_TOKEN_INVALID",
      message: "本人確認をやり直してください。",
      reason: "reauth",
    });

    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "RecTimeアカウントを削除する" })
    );

    await waitFor(() =>
      expect(
        screen.getByText("本人確認をやり直してください。")
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole("link", {
        name: "Microsoftアカウントで本人確認をやり直す",
      })
    ).toHaveAttribute("href", "/account-deletion");
  });

  it("削除受付済みエラーを利用者向けに表示する", () => {
    render(
      <MemoryRouter>
        <AccountDeletionCallbackPage
          data={{
            status: "error",
            message: "このRecTimeアカウントはすでに削除受付済みです。",
            reason: "already-deleted",
          }}
          gateway={testGateway}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "削除受付済みです" })
    ).toBeInTheDocument();
  });
});
