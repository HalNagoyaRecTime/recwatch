import { DELETION_AUTH_PENDING_STORAGE_KEY } from "~/config/storageKeys";

const RESULT_KEY = "rectime_deletion_auth_result";

export type DeletionAuthResult =
  { status: "confirmed"; token: string } | { status: "error"; message: string };

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function markDeletionAuthPending(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.setItem(DELETION_AUTH_PENDING_STORAGE_KEY, "1");
  } catch {
    // 利用できないstorageでは削除認証のpendingを保持しない。
  }
}

export function consumeDeletionAuthPending(): boolean {
  const storage = getSessionStorage();
  if (!storage) return false;

  let value: string | null;
  try {
    value = storage.getItem(DELETION_AUTH_PENDING_STORAGE_KEY);
  } catch {
    return false;
  }

  try {
    storage.removeItem(DELETION_AUTH_PENDING_STORAGE_KEY);
  } catch {
    // 読み取り結果だけでcallbackのSurfaceを判定できるようにする。
  }

  return value === "1";
}

export function clearDeletionAuthPending(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(DELETION_AUTH_PENDING_STORAGE_KEY);
  } catch {
    // 利用できないstorageでは何もしない。
  }
}

export function saveDeletionAuthResult(result: DeletionAuthResult): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    // 利用できないstorageでは認証結果を保存しない。
  }
}

export function consumeDeletionAuthResult(): DeletionAuthResult | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  let raw: string | null;
  try {
    raw = storage.getItem(RESULT_KEY);
  } catch {
    return null;
  }

  try {
    storage.removeItem(RESULT_KEY);
  } catch {
    // 読み取り結果だけでcallbackを処理できるようにする。
  }

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isDeletionAuthResult(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDeletionAuthResult(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(RESULT_KEY);
  } catch {
    // 利用できないstorageでは何もしない。
  }
}

function isDeletionAuthResult(value: unknown): value is DeletionAuthResult {
  if (typeof value !== "object" || value === null || !("status" in value)) {
    return false;
  }

  if (value.status === "confirmed") {
    return "token" in value && typeof value.token === "string";
  }

  return (
    value.status === "error" &&
    "message" in value &&
    typeof value.message === "string"
  );
}
