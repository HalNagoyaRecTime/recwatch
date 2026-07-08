import { currentUser, type AppRole } from "~/config/permissions";
import {
  sidebarSections,
  type SidebarItemConfig,
  type SidebarSectionConfig,
} from "~/config/routes";
import { canAccess } from "~/utils/permissions";
import { sidebarIconMap } from "~/features/frame/sidebar/utils/sidebar-icon-mapper";
import type { SidebarItemDef, SidebarSectionDef } from "~/types/sidebar";

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

export function buildSidebarMenu(role: AppRole = currentUser.role) {
  return sidebarSections
    .map((section) => mapSection(role, section))
    .filter((section): section is SidebarSectionDef => section !== null);
}
