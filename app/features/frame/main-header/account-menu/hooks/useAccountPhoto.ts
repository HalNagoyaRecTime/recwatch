import { useEffect, useState } from "react";

import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import {
  buildAccountPhotoApiUrl,
  hasAccountPhotoBeenRefreshedThisSession,
  markAccountPhotoRefreshedThisSession,
  PHOTO_CACHE_MS,
  readCachedAccountPhoto,
  writeCachedAccountPhoto,
} from "~/features/frame/main-header/account-menu/lib/accountPhotoCache";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/logout";

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

      const res = await fetch(photoUrl, {
        credentials: "include",
        headers: WEB_CLIENT_HEADERS,
      }).catch(() => null);

      if (!res?.ok) {
        return;
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        return;
      }

      const photo = {
        userId,
        avatarUrl,
        avatarUpdatedAt,
        blob,
        contentType:
          blob.type || res.headers.get("Content-Type") || "image/jpeg",
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
