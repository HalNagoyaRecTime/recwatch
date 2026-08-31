import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

vi.mock("~/config/env", () => ({
  hasBackendBaseUrl: () => true,
  buildBackendUrl: (path: string) => `https://api.example.com${path}`,
}));

const mocks = vi.hoisted(() => ({
  clearDeletionAuthPending: vi.fn(),
}));

vi.mock("~/features/account-deletion/lib/deletionAuthFlow", () => ({
  clearDeletionAuthPending: mocks.clearDeletionAuthPending,
}));

import { AuthLoginPage } from "./AuthLoginPage";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  mocks.clearDeletionAuthPending.mockReset();
});

describe("AuthLoginPage", () => {
  it("初期エラーキーに応じたメッセージを表示する", () => {
    render(
      <MemoryRouter>
        <AuthLoginPage initialError="account_deletion_pending" />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "このアカウントは削除処理中または削除済みのため、ログインできません。"
      )
    ).toBeInTheDocument();
  });

  it("ログインボタン押下時に削除確認フローの目印を消してから遷移する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    );

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });

    render(
      <MemoryRouter>
        <AuthLoginPage />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Microsoft アカウントでログイン/ })
    );

    expect(mocks.clearDeletionAuthPending).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(window.location.href).toBe(
        "https://api.example.com/api/v1/auth/microsoft/login"
      )
    );

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
