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
  activePatterns?: readonly string[];
  activeExclusions?: readonly string[];
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
    items: [
      {
        id: "members",
        label: "ユーザー管理",
        icon: "users",
        roles: ["admin", "manager"],
        children: [
          {
            id: "members-list",
            label: "学生管理",
            to: "/members",
            activePatterns: ["/members", "/members/teams"],
            roles: ["admin", "manager"],
          },
          {
            id: "classRoom",
            label: "クラス管理",
            to: "/classroom",
            roles: ["admin", "manager"],
          },
          {
            id: "teachers",
            label: "教官管理",
            to: "/teachers",
            roles: ["admin", "manager"],
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        id: "events",
        label: "イベント管理",
        icon: "trophy",
        roles: ["admin", "manager"],
        children: [
          {
            id: "events-list",
            label: "イベント登録一覧",
            to: "/events",
            activePatterns: [
              "/events",
              "/events/new",
              "/events/active",
              "/events/past",
              "/events/tournament",
              "/events/scoring",
              "/events/:competitionId/edit",
            ],
            roles: ["admin", "manager"],
          },
          {
            id: "events-assignments",
            label: "参加者設定",
            to: "/events/assignments",
            roles: ["admin", "manager"],
          },
          {
            id: "gathering-spots",
            label: "集合場所管理",
            to: "/gathering-spots",
            roles: ["admin", "manager"],
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        id: "operations",
        label: "運用管理",
        icon: "calendar",
        roles: ["admin", "manager", "member"],
        children: [
          {
            id: "schedule",
            label: "スケジュール管理",
            to: "/schedule",
            activePatterns: [
              "/schedule",
              "/schedule/new",
              "/schedule/:scheduleId/edit",
            ],
            roles: ["admin", "manager", "member"],
          },
          {
            id: "participants",
            label: "出場メンバー管理",
            to: "/participants",
            roles: ["admin", "manager"],
          },
          {
            id: "notification-management",
            label: "通知一覧",
            icon: "notificationHistory",
            to: "/notifications",
            activePatterns: [
              "/notifications",
              "/notifications/new",
              "/notifications/:notificationId",
              "/notifications/:notificationId/edit",
            ],
            roles: ["admin", "manager"],
          },
        ],
      },
    ],
  },
] satisfies SidebarSectionConfig[];
