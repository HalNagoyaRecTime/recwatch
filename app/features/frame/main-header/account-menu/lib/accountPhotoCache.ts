import { buildBackendUrl } from "~/config/env";

export type CachedAccountPhoto = {
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
const REFRESH_MARKER_PREFIX = "recwatch-account-photo-refreshed:";

export const PHOTO_CACHE_MS = 24 * 60 * 60 * 1000;

export function buildAccountPhotoApiUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return buildBackendUrl(pathOrUrl);
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

export async function readCachedAccountPhoto(
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

export async function writeCachedAccountPhoto(
  photo: CachedAccountPhoto
): Promise<void> {
  const db = await openPhotoDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).put(photo);
    transaction.oncomplete = () => resolve(undefined);
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => db.close());
}

export async function clearCachedAccountPhotos(): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return;
  }

  const db = await openPhotoDb().catch(() => null);
  if (!db) {
    return;
  }

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).clear();
    transaction.oncomplete = () => resolve(undefined);
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => db.close());
}

function getRefreshMarkerKey(userId: string) {
  return `${REFRESH_MARKER_PREFIX}${userId}`;
}

export function hasAccountPhotoBeenRefreshedThisSession(userId: string) {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  return sessionStorage.getItem(getRefreshMarkerKey(userId)) === "1";
}

export function markAccountPhotoRefreshedThisSession(userId: string) {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(getRefreshMarkerKey(userId), "1");
}

export function clearAccountPhotoRefreshMarkers() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(REFRESH_MARKER_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
