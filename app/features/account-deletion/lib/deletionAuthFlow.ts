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
  consumeDeletionAuthPending();
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
    return JSON.parse(raw) as DeletionAuthResult;
  } catch {
    return null;
  }
}
