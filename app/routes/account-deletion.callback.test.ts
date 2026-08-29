import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  confirmAccountDeletion: vi.fn(),
}));

vi.mock("~/features/account-deletion/api/account-deletion-client", () => ({
  confirmAccountDeletion: mocks.confirmAccountDeletion,
}));

import { clientLoader } from "./account-deletion.callback";

afterEach(() => {
  mocks.confirmAccountDeletion.mockReset();
});

function makeRequest(search: string) {
  return new Request(
    `https://recwatch.example.com/account-deletion/callback${search}`
  );
}

describe("account-deletion.callback clientLoader", () => {
  it("stateが無い場合はAPIを呼ばずにエラーを返す", async () => {
    const data = await clientLoader({ request: makeRequest("") });

    expect(mocks.confirmAccountDeletion).not.toHaveBeenCalled();
    expect(data.status).toBe("error");
  });

  it("stateとcodeだけをAPIへ渡し、それ以外のクエリ(戻り先URL等)は無視する", async () => {
    mocks.confirmAccountDeletion.mockResolvedValue({ status: "done" });

    const data = await clientLoader({
      request: makeRequest(
        "?state=abc&code=xyz&redirect=https://evil.example&userId=999"
      ),
    });

    expect(mocks.confirmAccountDeletion).toHaveBeenCalledWith({
      state: "abc",
      code: "xyz",
    });
    expect(data).toEqual({ status: "done" });
  });

  it("APIの結果をそのままページ用データとして返す", async () => {
    mocks.confirmAccountDeletion.mockResolvedValue({
      status: "error",
      message: "失敗しました",
    });

    const data = await clientLoader({ request: makeRequest("?state=abc") });

    expect(data).toEqual({ status: "error", message: "失敗しました" });
  });
});
