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
import {
  getAccessToken,
  setAccessToken,
} from "~/features/auth/lib/accessTokenStore";
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

describe("auth.callback clientLoader", () => {
  it("削除専用認証では通常ログインTokenを発行せず、削除確認Tokenを保存する", async () => {
    mocks.consumeDeletionAuthPending.mockReturnValue(true);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          deletion_confirmation_token: "deletion-token-abc",
          expires_in: 600,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
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
    expect(getAccessToken()).toBeNull();
  });

  it("削除Token取得エラーを技術コードではなく日本語で保存する", async () => {
    mocks.consumeDeletionAuthPending.mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "ACCOUNT_NOT_FOUND",
              message: "internal backend message",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        )
      )
    );

    await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
    );

    expect(mocks.saveDeletionAuthResult).toHaveBeenCalledWith({
      status: "error",
      message:
        "このMicrosoft 365アカウントに対応するRecTimeアカウントが見つかりません。",
    });
  });

  it("通常ログイン成功時は従来どおり通常Tokenを保存する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            access_token: "access-token",
            refresh_token_id: "refresh-id",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      )
    );

    const location = await getRedirectLocation(
      clientLoader({ request: makeRequest("?code=abc&state=xyz") })
    );

    expect(location).toBe("/");
  });
});
