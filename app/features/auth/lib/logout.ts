import { buildBackendUrl } from "~/config/env";
import {
  clearAccountPhotoRefreshMarkers,
  clearCachedAccountPhotos,
} from "~/features/frame/main-header/account-menu/lib/accountPhotoCache";

const WEB_CLIENT_HEADERS = { "X-Client-Type": "web" };

export async function logout() {
  clearAccountPhotoRefreshMarkers();
  await clearCachedAccountPhotos().catch(() => undefined);

  const logoutUrl = buildBackendUrl("/api/v1/auth/logout");
  if (!logoutUrl) {
    return;
  }

  await fetch(logoutUrl, {
    method: "POST",
    credentials: "include",
    headers: WEB_CLIENT_HEADERS,
  }).catch(() => undefined);
}

export { WEB_CLIENT_HEADERS };
