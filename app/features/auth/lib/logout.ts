import { buildBackendUrl } from "~/config/env";
import {
  getAccessToken,
  setAccessToken,
} from "~/features/auth/lib/accessTokenStore";
import { refreshAccessToken } from "~/features/auth/lib/refreshAccessToken";
import {
  clearAccountPhotoRefreshMarkers,
  clearCachedAccountPhotos,
} from "~/features/frame/main-header/account-menu/lib/accountPhotoCache";
import { clearAccountPhotoRequestState } from "~/features/frame/main-header/account-menu/lib/accountPhotoRequest";
import {
  getRefreshTokenId,
  setRefreshTokenId,
} from "~/features/auth/lib/refreshTokenStore";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";

export type LogoutResult =
  | { status: "ok"; msLogoutUrl: string | null }
  | { status: "error" };

export async function logout(): Promise<LogoutResult> {
  clearAccountPhotoRefreshMarkers();
  clearAccountPhotoRequestState();
  await clearCachedAccountPhotos().catch(() => undefined);

  try {
    return await performLogout();
  } finally {
    setAccessToken(null);
    setRefreshTokenId(null);
  }
}

async function performLogout(): Promise<LogoutResult> {
  const logoutUrl = buildBackendUrl("/api/v1/auth/logout");
  const accessToken = getAccessToken();
  if (!logoutUrl || !accessToken) {
    return { status: "error" };
  }

  let res = await requestLogout(logoutUrl, accessToken);

  // access tokenが期限切れの場合、backendのlogout APIは401を返す。
  // この時点でrefresh_token_idをローカルから削除してしまうと、backend側の
  // refresh tokenを失効させる手段がなくなり有効なまま残り続けてしまうため、
  // refreshしてから一度だけlogoutを再試行する。
  if (res?.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await requestLogout(logoutUrl, refreshed);
    }
  }

  if (!res?.ok) {
    return { status: "error" };
  }

  const body = (await res.json().catch(() => null)) as {
    ms_logout_url?: string;
  } | null;
  return { status: "ok", msLogoutUrl: body?.ms_logout_url ?? null };
}

function requestLogout(
  logoutUrl: string,
  accessToken: string
): Promise<Response | null> {
  const refreshTokenId = getRefreshTokenId();
  return fetch(logoutUrl, {
    method: "POST",
    headers: {
      ...WEB_CLIENT_HEADERS,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(
      refreshTokenId ? { refresh_token_id: refreshTokenId } : {}
    ),
  }).catch(() => null);
}
