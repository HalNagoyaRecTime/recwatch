import { buildBackendUrl } from "~/config/env";
import { setAccessToken } from "~/features/auth/lib/accessTokenStore";
import {
  getRefreshTokenId,
  setRefreshTokenId,
} from "~/features/auth/lib/refreshTokenStore";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";

type RefreshResponse = {
  access_token: string;
  refresh_token_id: string;
};

function isRefreshResponse(value: unknown): value is RefreshResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).access_token === "string" &&
    typeof (value as Record<string, unknown>).refresh_token_id === "string"
  );
}

// 同時に複数のリクエストが401を受け取っても、refresh_token_idの
// ローテーションによる競合を避けるため実行中のリフレッシュを1つに束ねる。
let inFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (inFlight) {
    return inFlight;
  }

  inFlight = performRefresh().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

async function performRefresh(): Promise<string | null> {
  const refreshTokenId = getRefreshTokenId();
  const refreshUrl = buildBackendUrl("/api/v1/auth/refresh");
  if (!refreshTokenId || !refreshUrl) {
    return null;
  }

  const res = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      ...WEB_CLIENT_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token_id: refreshTokenId }),
  }).catch(() => null);

  // ネットワーク断や5xxなど一時的な失敗ではrefresh_token_idを破棄しない。
  // バックエンドが明示的に無効と判定した場合(401)のみ、再ログインが必要な
  // 状態としてクリアする。それ以外は次回の再試行に委ねる。
  if (!res) {
    return null;
  }
  if (res.status === 401) {
    // 別タブが既にrefresh_token_idをローテーション済みの可能性がある
    // (localStorageはタブ間で共有される)。refresh開始時点のIDが今も
    // 保存されている場合のみクリアし、他タブが書き込んだ新しいIDを
    // 誤って消してしまわないようにする。
    if (getRefreshTokenId() === refreshTokenId) {
      setAccessToken(null);
      setRefreshTokenId(null);
    }
    return null;
  }

  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok || !isRefreshResponse(payload)) {
    return null;
  }

  setAccessToken(payload.access_token);
  setRefreshTokenId(payload.refresh_token_id);
  return payload.access_token;
}
