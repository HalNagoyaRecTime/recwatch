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
  confirmAccountDeletion: vi.fn(),
}));

vi.mock("~/features/account-deletion/api/account-deletion-client", () => ({
  accountDeletionUnavailableMessage:
    "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。",
  confirmAccountDeletion: mocks.confirmAccountDeletion,
}));

import { AccountDeletionCallbackPage } from "./AccountDeletionCallbackPage";

afterEach(() => {
  cleanup();
  mocks.confirmAccountDeletion.mockReset();
  window.localStorage.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/account-deletion/callback"]}>
      <AccountDeletionCallbackPage
        data={{
          status: "confirm",
          deletionConfirmationToken: "deletion-token",
        }}
      />
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
        screen.getByRole("heading", { name: "削除受付を完了しました" })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(
        "BackendがRecTimeアカウントの削除要求を正常に受け付けました。以後、このアカウントでRecTimeを利用することはできません。"
      )
    ).toBeInTheDocument();
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
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "削除受付済みです" })
    ).toBeInTheDocument();
  });
});
