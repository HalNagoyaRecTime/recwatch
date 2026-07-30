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
  it("HTTP statusをApiClientErrorに保持する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Notification is in use" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(apiClient.delete("/admin/notifications/10")).rejects.toEqual(
      new ApiClientError(409, "Notification is in use")
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
        credentials: "include",
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-Client-Type": "web",
        },
      }
    );
  });
});
