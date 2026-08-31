import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  confirmAccountDeletion: vi.fn(),
  consumeDeletionAuthResult: vi.fn(),
}));

vi.mock("~/features/account-deletion/api/account-deletion-client", () => ({
  confirmAccountDeletion: mocks.confirmAccountDeletion,
}));

vi.mock("~/features/account-deletion/lib/deletionAuthFlow", () => ({
  consumeDeletionAuthResult: mocks.consumeDeletionAuthResult,
}));

import { clientLoader } from "./account-deletion.callback";

afterEach(() => {
  mocks.confirmAccountDeletion.mockReset();
  mocks.consumeDeletionAuthResult.mockReset();
});

describe("account-deletion.callback clientLoader", () => {
  it("sessionStorageに結果が無い場合はAPIを呼ばずにエラーを返す", async () => {
    mocks.consumeDeletionAuthResult.mockReturnValue(null);

    const data = await clientLoader();

    expect(mocks.confirmAccountDeletion).not.toHaveBeenCalled();
    expect(data.status).toBe("error");
  });

  it("/auth/callbackが保存したエラーをそのまま表示する", async () => {
    mocks.consumeDeletionAuthResult.mockReturnValue({
      status: "error",
      message: "本人確認に失敗しました。",
    });

    const data = await clientLoader();

    expect(mocks.confirmAccountDeletion).not.toHaveBeenCalled();
    expect(data).toEqual({
      status: "error",
      message: "本人確認に失敗しました。",
    });
  });

  it("削除確認Tokenがあればそれだけをconfirm APIへ渡す", async () => {
    mocks.consumeDeletionAuthResult.mockReturnValue({
      status: "confirmed",
      token: "deletion-token-abc",
    });
    mocks.confirmAccountDeletion.mockResolvedValue({ status: "done" });

    const data = await clientLoader();

    expect(mocks.confirmAccountDeletion).toHaveBeenCalledWith(
      "deletion-token-abc"
    );
    expect(data).toEqual({ status: "done" });
  });
});
