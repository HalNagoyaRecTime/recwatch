import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/config/env", () => ({
  buildBackendUrl: (path: string) => `https://api.example.com${path}`,
}));

import { ApiClientError } from "./api-client-error";
import { apiClient } from "./api-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiClient", () => {
  it("セッションCookieを含めてJSONをPOSTする", async () => {
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "value" }),
    });
  });

  it("エラーレスポンスをApiClientErrorへ変換する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          statusText: "Forbidden",
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(apiClient.get("/resource")).rejects.toEqual(
      new ApiClientError(403, "Forbidden")
    );
  });
});
