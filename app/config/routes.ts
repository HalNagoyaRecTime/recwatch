import type { AppRole } from "./permissions";

export type NavIconKey =
  | "clock"
  | "dashboard"
  | "notification"
  | "settings"
  | "notificationHistory"
  | "classRoom"
  | "trophy"
  | "users";

type NavRoleConfig = {
  roles: AppRole[];
};

export type NavChildConfig = NavRoleConfig & {
  id: string;
  label: string;
  to: string;
  badge?: number | string;
};

export type NavItemConfig = NavRoleConfig & {
  id: string;
  label: string;
  icon: NavIconKey;
  to?: string;
  badge?: number | string;
  children?: NavChildConfig[];
};

export type NavSectionConfig = {
  label: string;
  items: NavItemConfig[];
};

export const navSections = [
  {
    label: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "dashboard",
        to: "/dashboard",
        roles: ["admin", "manager", "member"],
      },
      {
        id: "members",
        label: "Members",
        icon: "users",
        badge: 128,
        roles: ["admin", "manager"],
        children: [
          {
            id: "members-list",
            label: "Member List",
            to: "/members",
            roles: ["admin", "manager"],
          },
          {
            id: "members-import",
            label: "Import",
            to: "/members/import",
            roles: ["admin"],
          },
        ],
      },
      {
        id: "classRoom",
        label: "Class Rooms",
        icon: "classRoom",
        to: "/classroom",
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: "sports",
        label: "Sports Setup",
        icon: "trophy",
        roles: ["admin", "manager"],
        children: [
          {
            id: "sports-list",
            label: "Sports List",
            to: "/events",
            roles: ["admin", "manager"],
          },
        ],
      },
      {
        id: "schedule",
        label: "イベント管理",
        icon: "clock",
        to: "/schedule",
        roles: ["admin", "manager", "member"],
      },
      {
        id: "notification-create",
        label: "通知作成",
        icon: "notification",
        to: "/notifications/new",
        roles: ["admin", "manager"],
      },
      {
        id: "notification-management",
        label: "通知管理",
        icon: "notificationHistory",
        to: "/notifications",
        roles: ["admin", "manager"],
      },
    ],
  },
] satisfies NavSectionConfig[];

export const settingsItem = {
  id: "settings",
  label: "Settings",
  icon: "settings",
  to: "/settings",
  roles: ["admin", "manager"],
} satisfies NavItemConfig;
