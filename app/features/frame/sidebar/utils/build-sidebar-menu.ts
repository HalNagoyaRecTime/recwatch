import { resolveAppRole, type AppRole } from "~/config/permissions";
import {
  sidebarSections,
  type SidebarItemConfig,
  type SidebarSectionConfig,
} from "~/config/routes";
import { canAccess } from "~/utils/permissions";
import { sidebarIconMap } from "~/features/frame/sidebar/utils/sidebar-icon-mapper";
import type { SidebarItemDef, SidebarSectionDef } from "~/types/sidebar";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

function mapItem(
  role: AppRole,
  item: SidebarItemConfig
): SidebarItemDef | null {
  const children =
    item.children
      ?.map((child) => mapItem(role, child))
      .filter((child): child is SidebarItemDef => child !== null) ?? [];

  const isDirectlyVisible = canAccess(role, item.roles);
  const hasVisibleChildren = children.length > 0;

  if (!isDirectlyVisible && !hasVisibleChildren) {
    return null;
  }

  return {
    id: item.id,
    label: item.label,
    icon: item.icon ? sidebarIconMap[item.icon] : undefined,
    to: isDirectlyVisible ? item.to : undefined,
    activePatterns: item.activePatterns,
    activeExclusions: item.activeExclusions,
    children: children.length > 0 ? children : undefined,
    roles: item.roles,
  };
}

function mapSection(
  role: AppRole,
  section: SidebarSectionConfig
): SidebarSectionDef | null {
  const items = section.items
    .map((item) => mapItem(role, item))
    .filter((item): item is SidebarItemDef => item !== null);

  if (items.length === 0) {
    return null;
  }

  return {
    label: section.label,
    hasDivider: section.hasDivider,
    items,
  };
}

export function buildSidebarMenu(role: AppRole): SidebarSectionDef[];
export function buildSidebarMenu(
  user?: AccountUser | null
): SidebarSectionDef[];
export function buildSidebarMenu(
  userOrRole?: AccountUser | null | AppRole
): SidebarSectionDef[] {
  const resolvedRole =
    typeof userOrRole === "string"
      ? userOrRole
      : resolveAppRole(userOrRole ?? null);

  return sidebarSections
    .map((section) => mapSection(resolvedRole, section))
    .filter((section): section is SidebarSectionDef => section !== null);
}
