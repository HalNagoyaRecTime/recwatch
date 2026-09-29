import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeDeletionAuthResult: vi.fn(),
}));

vi.mock("~/features/account-deletion/lib/deletionAuthFlow", () => ({
  consumeDeletionAuthResult: mocks.consumeDeletionAuthResult,
}));

import { clientLoader } from "./account-deletion.callback";

afterEach(() => {
  mocks.consumeDeletionAuthResult.mockReset();
});

describe("account-deletion.callback clientLoader", () => {
  it("削除確認TokenをURLへ載せず、最終確認画面のデータへ渡す", async () => {
    mocks.consumeDeletionAuthResult.mockReturnValue({
      status: "confirmed",
      token: "deletion-token-abc",
    });

    await expect(clientLoader()).resolves.toEqual({
      status: "confirm",
      deletionConfirmationToken: "deletion-token-abc",
    });
  });

  it("結果が無い直接アクセスや再読込は削除受付ページへ戻す", async () => {
    mocks.consumeDeletionAuthResult.mockReturnValue(null);

    try {
      await clientLoader();
      throw new Error("expected a redirect");
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      expect((error as Response).status).toBe(302);
      expect((error as Response).headers.get("Location")).toBe(
        "/account-deletion?error=auth_required"
      );
    }
  });
});
