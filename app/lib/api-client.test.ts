import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/config/env", () => ({
  buildBackendUrl: (path: string) => `https://api.example.com${path}`,
}));

import { ApiClientError } from "./api-client-error";
import { apiClient } from "./api-client";
import { setAccessToken } from "~/features/auth/lib/accessTokenStore";
import { setRefreshTokenId } from "~/features/auth/lib/refreshTokenStore";

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
  setRefreshTokenId(null);
});

describe("apiClient", () => {
  it("アクセストークン無しでJSONをPOSTする", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiClient.post("/resource", { name: "value" })
    ).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/resource", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Client-Type": "web",
      },
      body: JSON.stringify({ name: "value" }),
    });
  });

  it("アクセストークンがある場合はAuthorizationヘッダーを付与する", async () => {
    setAccessToken("access-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/resource")).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/resource", {
      headers: {
        Accept: "application/json",
        "X-Client-Type": "web",
        Authorization: "Bearer access-token",
      },
    });
  });

  it("同じURLへの同時GETを1回の通信に束ねる", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = apiClient.get("/resource");
    const second = apiClient.get("/resource");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveResponse?.(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(Promise.all([first, second])).resolves.toEqual([
      { id: 1 },
      { id: 1 },
    ]);
  });

  it("401の場合はアクセストークンを更新してから1回だけ再試行する", async () => {
    setAccessToken("expired-token");
    setRefreshTokenId("refresh-id");
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "https://api.example.com/api/v1/auth/refresh") {
        return new Response(
          JSON.stringify({
            access_token: "refreshed-token",
            refresh_token_id: "new-refresh-id",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const authHeader = (init?.headers as Record<string, string>)
        ?.Authorization;
      if (authHeader === "Bearer expired-token") {
        return new Response(null, { status: 401 });
      }
      return new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/resource")).resolves.toEqual({ id: 1 });

    const resourceCalls = fetchMock.mock.calls.filter(
      ([url]) => url === "https://api.example.com/resource"
    );
    expect(resourceCalls).toHaveLength(2);
    const [, secondInit] = resourceCalls[1];
    expect((secondInit?.headers as Record<string, string>).Authorization).toBe(
      "Bearer refreshed-token"
    );
  });

  it("エラーレスポンスをApiClientErrorへ変換する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "FORBIDDEN", message: "Forbidden" },
          }),
          {
            status: 403,
            statusText: "Forbidden",
            headers: { "Content-Type": "application/json" },
          }
        )
      )
    );

    await expect(apiClient.get("/resource")).rejects.toEqual(
      new ApiClientError(403, "Forbidden", "FORBIDDEN")
    );
  });

  it("HTTP statusをApiClientErrorに保持する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "NOTIFICATION_IN_USE",
              message: "Notification is in use",
            },
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        )
      )
    );

    await expect(apiClient.delete("/admin/notifications/10")).rejects.toEqual(
      new ApiClientError(409, "Notification is in use", "NOTIFICATION_IN_USE")
    );
  });

  it("エラーコードとdetailsをApiClientErrorへ保持する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "VALIDATION_FAILED",
              message: "Invalid request",
              details: { fieldErrors: { name: ["Required"] } },
            },
          }),
          { status: 400 }
        )
      )
    );

    await expect(apiClient.get("/resource")).rejects.toEqual(
      new ApiClientError(400, "Invalid request", "VALIDATION_FAILED", {
        fieldErrors: { name: ["Required"] },
      })
    );
  });

  it("旧形式のフラットなエラーは共通形式として解釈しない", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        })
      )
    );

    await expect(apiClient.get("/resource")).rejects.toEqual(
      new ApiClientError(
        403,
        "APIエラーの内容を読み取れませんでした。（403）",
        "UNKNOWN_API_ERROR"
      )
    );
  });

  it("DELETEの204レスポンスを本文なしで処理する", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiClient.delete("/admin/notifications/10")
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/admin/notifications/10",
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-Client-Type": "web",
        },
      }
    );
  });
});
