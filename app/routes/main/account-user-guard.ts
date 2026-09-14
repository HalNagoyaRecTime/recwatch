import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

export function isAccountUser(value: unknown): value is AccountUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.display_name === "string" &&
    (value.is_staff === undefined || typeof value.is_staff === "boolean") &&
    (value.avatar_url === undefined ||
      value.avatar_url === null ||
      typeof value.avatar_url === "string") &&
    (value.avatar_updated_at === undefined ||
      value.avatar_updated_at === null ||
      typeof value.avatar_updated_at === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
