import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/config/env", () => ({
  buildBackendUrl: (path: string) => `https://api.example.com${path}`,
}));

const mocks = vi.hoisted(() => ({
  consumeDeletionAuthPending: vi.fn(),
  saveDeletionAuthResult: vi.fn(),
}));

vi.mock("~/features/account-deletion/lib/deletionAuthFlow", () => ({
  consumeDeletionAuthPending: mocks.consumeDeletionAuthPending,
  saveDeletionAuthResult: mocks.saveDeletionAuthResult,
}));

import { clientLoader } from "./auth.callback";
import { setAccessToken } from "~/features/auth/lib/accessTokenStore";
import { setRefreshTokenId } from "~/features/auth/lib/refreshTokenStore";

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
  setRefreshTokenId(null);
  mocks.consumeDeletionAuthPending.mockReset();
  mocks.saveDeletionAuthResult.mockReset();
  mocks.consumeDeletionAuthPending.mockReturnValue(false);
});

function makeRequest(search: string) {
  return new Request(`https://recwatch.example.com/auth/callback${search}`);
}

async function getRedirectLocation(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (response) {
    if (response instanceof Response) {
      return response.headers.get("Location");
    }
    throw response;
  }
  throw new Error("expected a redirect to be thrown");
}

describe("auth.callback clientLoader(通常ログイン)", () => {
  it("codeやstateが無ければauth_failedへリダイレクトする", async () => {
    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("") })
    );

    expect(location).toBe("/login?error=auth_failed");
  });

  it("ACCOUNT_DELETION_PENDINGの場合は専用のエラーへリダイレクトする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "ACCOUNT_DELETION_PENDING",
              message:
                "このアカウントは削除処理中または削除済みのため、ログインできません。",
            },
          }),
          { status: 410, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
    );

    expect(location).toBe("/login?error=account_deletion_pending");
  });

  it("それ以外の失敗は従来通りauth_failedへリダイレクトする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "INVALID_STATE", message: "state不一致" },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
    );

    expect(location).toBe("/login?error=auth_failed");
  });

  it("成功時はトップページへリダイレクトする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            access_token: "token",
            refresh_token_id: "refresh-id",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
    );

    expect(location).toBe("/");
  });
});

describe("auth.callback clientLoader(削除確認フロー)", () => {
  it("削除確認フロー中の目印があれば、通常ログインのtokenは呼ばずに削除確認ページへ遷移する", async () => {
    mocks.consumeDeletionAuthPending.mockReturnValue(true);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          deletion_confirmation_token: "deletion-token-abc",
          expires_in: 600,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const location = await getRedirectLocation(
      clientLoader({
        request: makeRequest(
          "?code=abc&state=xyz&redirect=https://evil.example"
        ),
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/microsoft/delete-token",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "abc", state: "xyz" }),
      })
    );
    expect(location).toBe("/account-deletion/callback");
    expect(mocks.saveDeletionAuthResult).toHaveBeenCalledWith({
      status: "confirmed",
      token: "deletion-token-abc",
    });
  });

  it("codeやstateが無ければAPIを呼ばずにエラーを保存して削除確認ページへ遷移する", async () => {
    mocks.consumeDeletionAuthPending.mockReturnValue(true);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("") })
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(location).toBe("/account-deletion/callback");
    expect(mocks.saveDeletionAuthResult).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" })
    );
  });

  it("delete-tokenが失敗した場合はバックエンドのエラーメッセージを保存する", async () => {
    mocks.consumeDeletionAuthPending.mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "ACCOUNT_NOT_FOUND",
              message:
                "このMicrosoftアカウントに対応するアカウントが見つかりません。",
            },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
    );

    expect(location).toBe("/account-deletion/callback");
    expect(mocks.saveDeletionAuthResult).toHaveBeenCalledWith({
      status: "error",
      message: "このMicrosoftアカウントに対応するアカウントが見つかりません。",
    });
  });
});
