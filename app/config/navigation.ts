import type { AppRole } from "./permissions";

export type NavigationIconKey =
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

export type NavigationItemConfig = {
  id: string;
  label: string;
  icon?: NavigationIconKey;
  to?: string;
  activePatterns?: readonly string[];
  activeExclusions?: readonly string[];
  children?: NavigationItemConfig[];
  roles: AppRole[];
  showInSidebar?: boolean;
  searchable?: boolean;
  searchLabel?: string;
  searchCategory?: string;
  searchKeywords?: readonly string[];
};

export type NavigationSectionConfig = {
  label?: string;
  hasDivider?: boolean;
  items: NavigationItemConfig[];
};

export const navigationSections: NavigationSectionConfig[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "ダッシュボード",
        icon: "dashboard",
        to: "/dashboard",
        roles: ["admin"],
        searchCategory: "ホーム",
        searchKeywords: ["home", "トップ"],
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
        searchCategory: "イベント",
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
            activeExclusions: ["/events/today", "/events/assignments"],
            roles: ["admin"],
            searchKeywords: ["イベント", "種目"],
          },
          {
            id: "events-new",
            label: "イベントの新規登録",
            to: "/events/new",
            roles: ["admin"],
            showInSidebar: false,
            searchCategory: "イベント",
            searchKeywords: ["イベント", "作成", "追加"],
          },
          {
            id: "gathering-spots",
            label: "集合場所管理",
            to: "/gathering-spots",
            roles: ["admin"],
            searchCategory: "イベント",
            searchKeywords: ["集合", "場所"],
          },
          {
            id: "venues",
            label: "実施場所管理",
            to: "/venues",
            roles: ["admin"],
            searchCategory: "イベント",
            searchKeywords: ["実施", "場所", "会場"],
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
            searchCategory: "通知",
            searchKeywords: ["お知らせ", "履歴"],
          },
          {
            id: "notifications-new",
            label: "通知の新規登録",
            to: "/notifications/new",
            roles: ["admin"],
            showInSidebar: false,
            searchCategory: "通知",
            searchKeywords: ["お知らせ", "配信", "送信"],
          },
        ],
      },
      {
        id: "team-management",
        label: "チーム管理",
        icon: "trophy",
        roles: ["admin"],
        searchCategory: "チーム・成績",
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
            searchKeywords: ["チーム", "team"],
          },
          {
            id: "ranking",
            label: "ランキング管理",
            to: "/ranking",
            activePatterns: ["/ranking", "/ranking/:teamId/edit"],
            roles: ["admin"],
            searchKeywords: ["順位", "成績"],
          },
        ],
      },
      {
        id: "user-management",
        label: "ユーザー管理",
        icon: "users",
        roles: ["admin"],
        searchCategory: "管理",
        children: [
          {
            id: "students",
            label: "学生管理",
            to: "/students",
            activePatterns: ["/students", "/students/import"],
            roles: ["admin"],
            searchKeywords: ["学生", "CSV", "名簿", "学籍番号", "student"],
          },
          {
            id: "classroom",
            label: "クラス管理",
            to: "/classrooms",
            roles: ["admin"],
            searchKeywords: ["教室", "クラス"],
          },
          {
            id: "classroom-new",
            label: "クラスの新規登録",
            to: "/classrooms/new",
            roles: ["admin"],
            showInSidebar: false,
            searchCategory: "管理",
            searchKeywords: ["クラス", "作成", "追加"],
          },
          {
            id: "teachers",
            label: "教官管理",
            to: "/teachers",
            roles: ["admin"],
            searchKeywords: ["先生", "教官", "新規登録"],
          },
        ],
      },
    ],
  },
];
