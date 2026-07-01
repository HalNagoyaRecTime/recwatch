import { buildBackendUrl } from "~/config/env";
import {
  clearAccountPhotoRefreshMarkers,
  clearCachedAccountPhotos,
} from "~/features/frame/main-header/account-menu/lib/accountPhotoCache";

const WEB_CLIENT_HEADERS = { "X-Client-Type": "web" };

export type LogoutResult =
  | { status: "ok"; msLogoutUrl: string | null }
  | { status: "error" };

export async function logout(): Promise<LogoutResult> {
  clearAccountPhotoRefreshMarkers();
  await clearCachedAccountPhotos().catch(() => undefined);

  const logoutUrl = buildBackendUrl("/api/v1/auth/logout");
  if (!logoutUrl) {
    return { status: "error" };
  }

  const res = await fetch(logoutUrl, {
    method: "POST",
    credentials: "include",
    headers: WEB_CLIENT_HEADERS,
  }).catch(() => null);

  if (!res?.ok) {
    return { status: "error" };
  }

  const body = (await res.json().catch(() => null)) as {
    ms_logout_url?: string;
  } | null;
  return { status: "ok", msLogoutUrl: body?.ms_logout_url ?? null };
}

export { WEB_CLIENT_HEADERS };
