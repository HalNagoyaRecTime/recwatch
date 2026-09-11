import type { AppRole } from "./permissions";

export type SidebarIconKey =
  | "calendar"
  | "clock"
  | "dashboard"
  | "notification"
  | "file"
  | "home"
  | "settings"
  | "classRoom"
  | "timing"
  | "trophy"
  | "team"
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
        icon: "dashboard",
        to: "/dashboard",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "運用",
    items: [
      {
        id: "events",
        label: "イベント",
        icon: "calendar",
        roles: ["admin"],
        children: [
          {
            id: "events-list",
            label: "イベント一覧",
            to: "/events",
            activePatterns: [
              "/events",
              "/events/new",
              "/events/:competitionId/edit",
            ],
            roles: ["admin"],
          },
          {
            id: "events-active",
            label: "本日の進行",
            to: "/events/today",
            roles: ["admin"],
          },
        ],
      },
      {
        id: "notifications",
        label: "通知",
        icon: "notification",
        to: "/notifications",
        activePatterns: [
          "/notifications",
          "/notifications/new",
          "/notifications/:notificationId",
          "/notifications/:notificationId/edit",
        ],
        roles: ["admin"],
      },
    ],
  },
  {
    label: "チーム・成績",
    items: [
      {
        id: "teams",
        label: "チーム",
        icon: "team",
        to: "/teams",
        roles: ["admin"],
      },
      {
        id: "ranking",
        label: "ランキング",
        icon: "trophy",
        to: "/ranking",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "管理",
    items: [
      {
        id: "user-management",
        label: "ユーザー",
        icon: "users",
        roles: ["admin"],
        children: [
          {
            id: "students",
            label: "学生",
            to: "/student",
            activePatterns: ["/student", "/student/import"],
            roles: ["admin"],
          },
          {
            id: "teachers",
            label: "教官",
            to: "/teachers",
            roles: ["admin"],
          },
        ],
      },
      {
        id: "classroom",
        label: "クラス",
        icon: "classRoom",
        to: "/classroom",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "削除予定",
    items: [
      {
        id: "events-assignments",
        label: "参加者設定",
        to: "/events/assignments",
        roles: ["admin"],
      },
      {
        id: "gathering-spots",
        label: "集合場所管理",
        to: "/gathering-spots",
        roles: ["admin"],
      },
      {
        id: "participants",
        label: "出場メンバー管理",
        to: "/participants",
        roles: ["admin"],
      },
      {
        id: "legacy-members",
        label: "旧学生管理",
        to: "/members",
        roles: ["admin"],
      },
      {
        id: "schedule",
        label: "スケジュール",
        to: "/schedule",
        activePatterns: [
          "/schedule",
          "/schedule/new",
          "/schedule/:scheduleId/edit",
        ],
        roles: ["admin"],
      },
    ],
  },
] satisfies SidebarSectionConfig[];
