import { useEffect, useState } from "react";

import { buildBackendUrl } from "~/config/env";
import { getAccessToken } from "~/features/auth/lib/accessTokenStore";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { requestAccountPhoto } from "~/features/frame/main-header/account-menu/lib/accountPhotoRequest";
import {
  buildAccountPhotoApiUrl,
  hasAccountPhotoBeenRefreshedThisSession,
  markAccountPhotoRefreshedThisSession,
  PHOTO_CACHE_MS,
  readCachedAccountPhoto,
  writeCachedAccountPhoto,
} from "~/features/frame/main-header/account-menu/lib/accountPhotoCache";

function isBackendOrigin(url: string) {
  const backendUrl = buildBackendUrl("/");
  if (!backendUrl || typeof window === "undefined") {
    return false;
  }

  return (
    new URL(url, window.location.href).origin ===
    new URL(backendUrl, window.location.href).origin
  );
}

export function useAccountPhoto(user?: AccountUser | null) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !user.avatar_url || typeof indexedDB === "undefined") {
      void Promise.resolve().then(() => setPhotoUrl(null));
      return;
    }

    const userId = user.id;
    const avatarUrl = user.avatar_url;
    const avatarUpdatedAt = user.avatar_updated_at ?? null;
    let cancelled = false;
    let activeObjectUrl: string | null = null;
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setPhotoUrl(null);
      }
    });

    function showBlob(blob: Blob) {
      const objectUrl = URL.createObjectURL(blob);
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
      activeObjectUrl = objectUrl;
      setPhotoUrl(objectUrl);
    }

    async function loadPhoto() {
      const cached = await readCachedAccountPhoto(userId).catch(() => null);
      const cacheMatches =
        cached?.avatarUrl === avatarUrl &&
        cached.avatarUpdatedAt === avatarUpdatedAt;
      const refreshedThisSession =
        hasAccountPhotoBeenRefreshedThisSession(userId);
      const shouldRefresh =
        !refreshedThisSession ||
        !cacheMatches ||
        !cached ||
        Date.now() - cached.updatedAt > PHOTO_CACHE_MS;

      if (cached && cacheMatches && !cancelled) {
        showBlob(cached.blob);
      } else if (!cancelled) {
        setPhotoUrl(null);
      }

      if (!shouldRefresh) {
        return;
      }

      const photoUrl = buildAccountPhotoApiUrl(avatarUrl);
      if (!photoUrl) {
        return;
      }

      const accessToken = getAccessToken();
      const init: RequestInit = isBackendOrigin(photoUrl)
        ? {
            headers: {
              ...WEB_CLIENT_HEADERS,
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          }
        : {};

      const response = await requestAccountPhoto(userId, photoUrl, init);
      if (!response) {
        return;
      }
      const { blob, contentType } = response;

      const photo = {
        userId,
        avatarUrl,
        avatarUpdatedAt,
        blob,
        contentType,
        updatedAt: Date.now(),
      };

      await writeCachedAccountPhoto(photo).catch(() => undefined);
      markAccountPhotoRefreshedThisSession(userId);
      if (!cancelled) {
        showBlob(blob);
      }
    }

    void loadPhoto();

    return () => {
      cancelled = true;
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
    };
  }, [user?.avatar_updated_at, user?.avatar_url, user?.id]);

  return photoUrl;
}
