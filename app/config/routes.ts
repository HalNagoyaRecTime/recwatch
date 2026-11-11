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
    hasDivider: true,
    items: [
      {
        id: "events",
        label: "イベント管理",
        icon: "calendar",
        roles: ["admin"],
        children: [
          {
            id: "events-list",
            label: "イベント管理",
            to: "/events",
            activePatterns: [
              "/events",
              "/events/new",
              "/events/:eventId",
              "/events/:eventId/edit",
              "/events/:eventId/gatherings",
            ],
            // `/events/:eventId` は固定パスの画面にも一致するため、別項目のものを除外する
            activeExclusions: ["/events/today"],
            roles: ["admin"],
          },
          {
            id: "gathering-spots",
            label: "集合場所管理",
            to: "/gathering-spots",
            roles: ["admin"],
          },
          {
            id: "venues",
            label: "実施場所管理",
            to: "/venues",
            roles: ["admin"],
          },
          {
            id: "notifications",
            label: "通知管理",
            to: "/notifications",
            activePatterns: [
              "/notifications",
              "/notifications/new",
              "/notifications/monitor",
              "/notifications/:notificationId",
              "/notifications/:notificationId/edit",
            ],
            roles: ["admin"],
          },
        ],
      },
      {
        id: "team-management",
        label: "チーム管理",
        icon: "trophy",
        roles: ["admin"],
        children: [
          {
            id: "teams",
            label: "チーム管理",
            to: "/teams",
            activePatterns: [
              "/teams",
              "/teams/new",
              "/teams/:id",
              "/teams/:id/edit",
            ],
            roles: ["admin"],
          },
          {
            id: "ranking",
            label: "ランキング管理",
            to: "/ranking",
            activePatterns: ["/ranking", "/ranking/:teamId/edit"],
            roles: ["admin"],
          },
        ],
      },
      {
        id: "user-management",
        label: "ユーザー管理",
        icon: "users",
        roles: ["admin"],
        children: [
          {
            id: "students",
            label: "学生管理",
            to: "/students",
            activePatterns: ["/students", "/students/import"],
            roles: ["admin"],
          },
          {
            id: "classroom",
            label: "クラス管理",
            to: "/classrooms",
            roles: ["admin"],
          },
          {
            id: "teachers",
            label: "教官管理",
            to: "/teachers",
            roles: ["admin"],
          },
        ],
      },
    ],
  },
] satisfies SidebarSectionConfig[];
