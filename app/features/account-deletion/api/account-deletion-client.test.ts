import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/config/env", () => ({
  hasBackendBaseUrl: () => true,
  buildBackendUrl: (path: string) => `https://api.example.com${path}`,
}));

import {
  confirmAccountDeletion,
  startAccountDeletionAuth,
} from "./account-deletion-client";

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe("startAccountDeletionAuth", () => {
  it("削除専用Microsoft認証のURLを返し、通常認証とは別の状態を記録する", async () => {
    const result = await startAccountDeletionAuth();

    expect(result).toEqual({
      ok: true,
      authUrl: "https://api.example.com/api/v1/auth/microsoft/delete-login",
    });
    expect(window.sessionStorage.getItem("rectime_deletion_auth_pending")).toBe(
      "1"
    );
  });
});

describe("confirmAccountDeletion", () => {
  it("DELETE /auth/meへTokenだけを送り、202とBodyなしを受付成功として扱う", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 202,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await confirmAccountDeletion("deletion-token");

    expect(result).toEqual({ status: "done" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/me",
      {
        method: "DELETE",
        headers: {
          "X-Client-Type": "web",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deletion_confirmation_token: "deletion-token",
        }),
      }
    );
    expect(fetchMock.mock.calls[0]?.[1]?.headers).not.toHaveProperty(
      "Authorization"
    );
  });

  it("Token無効エラーを本人確認やり直し用の日本語へ変換する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "DELETION_CONFIRMATION_TOKEN_INVALID",
              message: "internal backend message",
            },
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        )
      )
    );

    const result = await confirmAccountDeletion("expired-token");

    expect(result).toEqual({
      status: "error",
      code: "DELETION_CONFIRMATION_TOKEN_INVALID",
      message:
        "本人確認の有効期限が切れたか、確認情報が無効です。Microsoft 365アカウントで本人確認をやり直してください。",
      reason: "reauth",
    });
  });

  it("5xxや通信失敗を安全な汎用メッセージへ変換する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
    );

    await expect(confirmAccountDeletion("token")).resolves.toEqual({
      status: "error",
      code: "HTTP_503",
      message:
        "削除受付サービスでエラーが発生しました。時間をおいてもう一度お試しください。",
      reason: "generic",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network unavailable"))
    );

    await expect(confirmAccountDeletion("token")).resolves.toEqual({
      status: "error",
      code: "NETWORK_ERROR",
      message:
        "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。",
      reason: "generic",
    });
  });
});
