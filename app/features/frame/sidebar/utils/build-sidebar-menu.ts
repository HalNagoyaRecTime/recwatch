import { currentUser, type AppRole } from "~/config/permissions";
import {
  sidebarSections,
  type SidebarItemConfig,
  type SidebarSectionConfig,
} from "~/config/routes";
import { canAccess } from "~/utils/permissions";
import { sidebarIconMap } from "~/features/frame/sidebar/utils/sidebar-icon-mapper";
import type {
  SidebarChildDef,
  SidebarItemDef,
  SidebarSectionDef,
} from "~/types/sidebar";

function mapChildren(
  role: AppRole,
  children: SidebarItemConfig["children"] = []
) {
  return children
    .filter((child) => canAccess(role, child.roles))
    .map<SidebarChildDef>(({ id, label, to, roles }) => ({
      id,
      label,
      to,
      roles,
    }));
}

function mapItem(
  role: AppRole,
  item: SidebarItemConfig
): SidebarItemDef | null {
  const children = mapChildren(role, item.children);
  const isDirectlyVisible = canAccess(role, item.roles);
  const hasVisibleChildren = children.length > 0;

  if (!isDirectlyVisible && !hasVisibleChildren) {
    return null;
  }

  return {
    id: item.id,
    label: item.label,
    icon: sidebarIconMap[item.icon],
    to: isDirectlyVisible ? item.to : undefined,
    children,
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
