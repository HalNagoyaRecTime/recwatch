import { useEffect, useState } from "react";

import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type CachedAccountPhoto = {
  userId: string;
  avatarUrl: string;
  avatarUpdatedAt: string | null;
  blob: Blob;
  contentType: string;
  updatedAt: number;
};

const DB_NAME = "recwatch-account-cache";
const DB_VERSION = 1;
const PHOTO_STORE = "accountPhotos";
const PHOTO_CACHE_MS = 24 * 60 * 60 * 1000;

function buildApiUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, import.meta.env.VITE_BACKEND_BASE_URL).toString();
}

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCachedPhoto(
  userId: string
): Promise<CachedAccountPhoto | null> {
  const db = await openPhotoDb();

  return new Promise<CachedAccountPhoto | null>((resolve, reject) => {
    const request = db
      .transaction(PHOTO_STORE, "readonly")
      .objectStore(PHOTO_STORE)
      .get(userId);

    request.onsuccess = () =>
      resolve((request.result as CachedAccountPhoto | undefined) ?? null);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

async function writeCachedPhoto(photo: CachedAccountPhoto): Promise<void> {
  const db = await openPhotoDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).put(photo);
    transaction.oncomplete = () => resolve(undefined);
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => db.close());
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

    function showBlob(blob: Blob) {
      const objectUrl = URL.createObjectURL(blob);
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
      activeObjectUrl = objectUrl;
      setPhotoUrl(objectUrl);
    }

    async function loadPhoto() {
      const cached = await readCachedPhoto(userId).catch(() => null);
      const cacheMatches =
        cached?.avatarUrl === avatarUrl &&
        cached.avatarUpdatedAt === avatarUpdatedAt;
      const shouldRefresh =
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

      const res = await fetch(buildApiUrl(avatarUrl), {
        credentials: "include",
        headers: { "X-Client-Type": "web" },
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
      } satisfies CachedAccountPhoto;

      await writeCachedPhoto(photo).catch(() => undefined);
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
