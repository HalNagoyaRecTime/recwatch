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
        id: "members",
        label: "メンバー",
        icon: "users",
        roles: ["admin", "manager"],
        children: [
          {
            id: "members-list",
            label: "ユーザー管理",
            to: "/members",
            roles: ["admin", "manager"],
          },
          {
            id: "members-import",
            label: "インポート",
            to: "/members/import",
            roles: ["admin"],
          },
          {
            id: "classRoom",
            label: "クラス一覧",
            icon: "classRoom",
            to: "/classroom",
            roles: ["admin", "manager"],
          },
        ],
      },
    ],
  },
  {
    label: "イベント",
    items: [
      {
        id: "events",
        label: "競技マスター",
        icon: "trophy",
        roles: ["admin", "manager"],
        children: [
          {
            id: "events-list",
            label: "競技一覧",
            to: "/events",
            roles: ["admin", "manager"],
          },
          {
            id: "events-new",
            label: "新規登録",
            to: "/events/new",
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
        children: [
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
    ],
  },
  {
    hasDivider: true,
    items: [
      {
        id: "settings",
        label: "設定",
        icon: "settings",
        to: "/settings",
        roles: ["admin", "manager"],
      },
    ],
  },
] satisfies SidebarSectionConfig[];
