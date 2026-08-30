import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/config/env", () => ({
  buildBackendUrl: (path: string) => `https://api.example.com${path}`,
}));

import { clientLoader } from "./auth.callback";
import { setAccessToken } from "~/features/auth/lib/accessTokenStore";
import { setRefreshTokenId } from "~/features/auth/lib/refreshTokenStore";

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
  setRefreshTokenId(null);
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
