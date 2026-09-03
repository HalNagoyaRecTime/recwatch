import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccessToken, setAccessToken } from "./accessTokenStore";
import { getRefreshTokenId, setRefreshTokenId } from "./refreshTokenStore";
import { logout } from "./logout";
import { APP_NOTIFICATION_STORAGE_KEY } from "~/features/frame/feedback/model/app-notification";

function mockLogoutResponse(ok: boolean, status: number): Response {
  return {
    ok,
    status,
    json: async () => ({}),
  } as Response;
}

describe("logout", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setAccessToken("access-token");
    setRefreshTokenId("refresh-token-id");
    vi.restoreAllMocks();
  });

  it("正常にログアウトしたときFrontend通知履歴を削除する", async () => {
    window.localStorage.setItem(APP_NOTIFICATION_STORAGE_KEY, "history");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockLogoutResponse(true, 200))
    );

    const result = await logout();

    expect(result.status).toBe("ok");
    expect(
      window.localStorage.getItem(APP_NOTIFICATION_STORAGE_KEY)
    ).toBeNull();
  });

  it("ログアウトに失敗したときFrontend通知履歴を保持する", async () => {
    window.localStorage.setItem(APP_NOTIFICATION_STORAGE_KEY, "history");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockLogoutResponse(false, 500))
    );

    const result = await logout();

    expect(result.status).toBe("error");
    expect(window.localStorage.getItem(APP_NOTIFICATION_STORAGE_KEY)).toBe(
      "history"
    );
    expect(getAccessToken()).toBeNull();
    expect(getRefreshTokenId()).toBeNull();
  });
});
