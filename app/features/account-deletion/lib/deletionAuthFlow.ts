const PENDING_KEY = "rectime_deletion_auth_pending";
const RESULT_KEY = "rectime_deletion_auth_result";

export type DeletionAuthResult =
  | { status: "confirmed"; token: string }
  | { status: "error"; message: string };

function hasSessionStorage(): boolean {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

export function markDeletionAuthPending(): void {
  if (!hasSessionStorage()) return;
  window.sessionStorage.setItem(PENDING_KEY, "1");
}

export function consumeDeletionAuthPending(): boolean {
  if (!hasSessionStorage()) return false;
  const value = window.sessionStorage.getItem(PENDING_KEY);
  window.sessionStorage.removeItem(PENDING_KEY);
  return value === "1";
}

export function clearDeletionAuthPending(): void {
  if (!hasSessionStorage()) return;
  window.sessionStorage.removeItem(PENDING_KEY);
}

export function saveDeletionAuthResult(result: DeletionAuthResult): void {
  if (!hasSessionStorage()) return;
  window.sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function consumeDeletionAuthResult(): DeletionAuthResult | null {
  if (!hasSessionStorage()) return null;
  const raw = window.sessionStorage.getItem(RESULT_KEY);
  window.sessionStorage.removeItem(RESULT_KEY);
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
  if (!hasSessionStorage()) return;
  window.sessionStorage.removeItem(RESULT_KEY);
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
