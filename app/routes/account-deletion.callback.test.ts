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

  it("結果が無い直接アクセスや再読込は本人確認やり直しのエラーになる", async () => {
    mocks.consumeDeletionAuthResult.mockReturnValue(null);

    await expect(clientLoader()).resolves.toEqual({
      status: "error",
      message:
        "本人確認の結果を確認できませんでした。削除受付ページからやり直してください。",
      reason: "reauth",
    });
  });
});
