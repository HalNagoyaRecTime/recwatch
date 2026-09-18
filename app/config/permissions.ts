export type AppRole = "admin" | "manager" | "member";

export function resolveAppRole(user?: { is_staff?: boolean } | null): AppRole {
  return user?.is_staff === true ? "admin" : "member";
}
