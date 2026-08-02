import type { AppRole } from "./permissions";

export type SidebarIconKey =
  | "calendar"
  | "clock"
  | "dashboard"
  | "notification"
  | "file"
  | "home"
  | "settings"
  | "notificationHistory"
  | "classRoom"
  | "timing"
  | "trophy"
  | "users";

type SidebarRoleConfig = {
  roles: AppRole[];
};

export type SidebarItemConfig = SidebarRoleConfig & {
  id: string;
  label: string;
  icon?: SidebarIconKey;
  to?: string;
  children?: SidebarItemConfig[];
};

export type SidebarSectionConfig = {
  label?: string;
  hasDivider?: boolean;
  items: SidebarItemConfig[];
};

export const sidebarSections = [
  {
    items: [
      {
        id: "dashboard",
        label: "ダッシュボード",
        icon: "home",
        to: "/dashboard",
        roles: ["admin", "manager", "member"],
      },
    ],
  },
  {
    label: "管理",
    items: [
      {
        id: "events",
        label: "イベント",
        icon: "calendar",
        roles: ["admin", "manager", "member"],
        children: [
          {
            id: "events-new",
            label: "新規作成",
            to: "/events/new",
            roles: ["admin", "manager"],
          },
        ],
      },
      {
        id: "members",
        label: "メンバー",
        icon: "users",
        roles: ["admin", "manager"],
        children: [
          {
            id: "members-list",
            label: "メンバー一覧",
            to: "/members",
            roles: ["admin", "manager"],
          },
          {
            id: "members-import",
            label: "インポート",
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
        label: "競技マスター",
        icon: "trophy",
        roles: ["admin", "manager"],
        children: [
          {
            id: "sports-list",
            label: "競技一覧",
            to: "/sports",
            roles: ["admin", "manager"],
          },
          {
            id: "sports-tournament",
            label: "Tournament",
            to: "/sports/tournament",
            roles: ["admin"],
          },
          {
            id: "sports-scoring",
            label: "Scoring Rules",
            to: "/sports/scoring",
            roles: ["admin", "manager"],
          },
        ],
      },
    ],
  },
  {
    label: "運用",
    items: [
      {
        id: "schedule",
        label: "スケジュール",
        icon: "calendar",
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
  {
    hasDivider: true,
    items: [
      {
        id: "settings",
        label: "イベント管理",
        icon: "settings",
        to: "/settings",
        roles: ["admin", "manager"],
      },
    ],
  },
] satisfies SidebarSectionConfig[];
