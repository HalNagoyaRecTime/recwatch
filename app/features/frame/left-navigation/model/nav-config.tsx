import {
  Clock3Icon,
  GraduationCap,
  HistoryIcon,
  LayoutDashboardIcon,
  SendIcon,
  Settings2Icon,
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

// https://lucide.dev/icons/
const iconMap: Record<NavIconKey, ReactNode> = {
  clock: <Clock3Icon size={iconSize} strokeWidth={1.8} />,
  dashboard: <LayoutDashboardIcon size={iconSize} strokeWidth={1.8} />,
  notification: <SendIcon size={iconSize} strokeWidth={1.8} />,
  settings: <Settings2Icon size={iconSize} strokeWidth={1.8} />,
  notificationHistory: <HistoryIcon size={iconSize} strokeWidth={1.8} />,
  classRoom: <GraduationCap size={iconSize} strokeWidth={1.8} />,
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

// そのロールに実際に表示されるナビゲーション項目のtoを平坦化した一覧。
// あるtoがpathnameのプレフィックスに一致しても、より具体的な(長い)toを持つ
// 別の"表示されている"ナビゲーション項目が存在する場合はそちらを優先させ、
// 兄弟項目同士が誤って同時にアクティブ表示されるのを防ぐために使う。
// ロールでフィルタされ実際には表示されていない項目のtoを含めてしまうと、
// 逆に表示されている項目が正しくアクティブ表示されなくなるため、
// 必ず表示対象と同じロールフィルタを通した結果から算出する。
export function getAllVisibleNavPaths(role: AppRole = currentUser.role) {
  const sections = getVisibleNavSections(role);
  const settings = getVisibleSettingsItem(role);

  const sectionPaths = sections.flatMap((section) =>
    section.items.flatMap((item) => [
      ...(item.to ? [item.to] : []),
      ...(item.children?.map((child) => child.to) ?? []),
    ])
  );

  return settings?.to ? [...sectionPaths, settings.to] : sectionPaths;
}
