import {
  CalendarIcon,
  Clock3Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  TimerResetIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { currentUser, type AppRole } from "~/config/permissions";
import {
  navSections,
  settingsItem as settingsItemConfig,
  type NavIconKey,
  type NavItemConfig,
  type NavSectionConfig,
} from "~/config/routes";
import type { NavChildDef, NavItemDef, NavSectionDef } from "~/types/nav";

const iconSize = 15;

const iconMap: Record<NavIconKey, ReactNode> = {
  calendar: <CalendarIcon size={iconSize} strokeWidth={1.8} />,
  clock: <Clock3Icon size={iconSize} strokeWidth={1.8} />,
  dashboard: <LayoutDashboardIcon size={iconSize} strokeWidth={1.8} />,
  file: <FileTextIcon size={iconSize} strokeWidth={1.8} />,
  settings: <Settings2Icon size={iconSize} strokeWidth={1.8} />,
  timing: <TimerResetIcon size={iconSize} strokeWidth={1.8} />,
  trophy: <TrophyIcon size={iconSize} strokeWidth={1.8} />,
  users: <UsersIcon size={iconSize} strokeWidth={1.8} />,
};

function canAccess(role: AppRole, roles: AppRole[]) {
  return roles.includes(role);
}

function mapChildren(role: AppRole, children: NavItemConfig["children"] = []) {
  return children
    .filter((child) => canAccess(role, child.roles))
    .map<NavChildDef>(({ id, label, to, badge, roles }) => ({
      id,
      label,
      to,
      badge: typeof badge === "number" ? String(badge) : badge,
      roles,
    }));
}

function mapItem(role: AppRole, item: NavItemConfig): NavItemDef | null {
  const children = mapChildren(role, item.children);
  const isDirectlyVisible = canAccess(role, item.roles);
  const hasVisibleChildren = children.length > 0;

  if (!isDirectlyVisible && !hasVisibleChildren) {
    return null;
  }

  return {
    id: item.id,
    label: item.label,
    icon: iconMap[item.icon],
    to: isDirectlyVisible ? item.to : undefined,
    badge: item.badge,
    children,
    roles: item.roles,
  };
}

function mapSection(
  role: AppRole,
  section: NavSectionConfig
): NavSectionDef | null {
  const items = section.items
    .map((item) => mapItem(role, item))
    .filter((item): item is NavItemDef => item !== null);

  if (items.length === 0) {
    return null;
  }

  return {
    label: section.label,
    items,
  };
}

export function getVisibleNavSections(role: AppRole = currentUser.role) {
  return navSections
    .map((section) => mapSection(role, section))
    .filter((section): section is NavSectionDef => section !== null);
}

export function getVisibleSettingsItem(role: AppRole = currentUser.role) {
  return mapItem(role, settingsItemConfig);
}
