import type { AppRole } from "~/config/permissions";

export function canAccess(role: AppRole, roles: AppRole[]) {
  return roles.includes(role);
}
