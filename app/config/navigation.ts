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

export const navigationSections = [
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
            searchLabel: "イベント登録一覧",
            searchCategory: "イベント",
            searchKeywords: ["イベント", "種目"],
            to: "/events",
            activePatterns: [
              "/events",
              "/events/new",
              "/events/:competitionId",
              "/events/:competitionId/edit",
              "/events/:competitionId/gatherings",
            ],
            // `/events/:competitionId` は固定パスの画面にも一致するため、別項目のものを除外する
            activeExclusions: ["/events/today", "/events/assignments"],
            roles: ["admin"],
          },
          {
            id: "events-active",
            label: "本日の進行",
            to: "/events/today",
            roles: ["admin"],
            searchCategory: "イベント",
            searchKeywords: ["進行", "当日"],
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
        searchLabel: "通知一覧",
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
    label: "チーム・成績",
    items: [
      {
        id: "teams",
        label: "チーム",
        icon: "team",
        to: "/teams",
        roles: ["admin"],
        searchCategory: "チーム・成績",
        searchKeywords: ["team"],
      },
      {
        id: "ranking",
        label: "ランキング",
        icon: "trophy",
        to: "/ranking",
        roles: ["admin"],
        searchCategory: "チーム・成績",
        searchKeywords: ["順位", "成績"],
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
            searchLabel: "学生管理",
            to: "/students",
            activePatterns: ["/students", "/students/import"],
            roles: ["admin"],
            searchCategory: "管理",
            searchKeywords: ["CSV", "名簿", "学籍番号", "student"],
          },
          {
            id: "teachers",
            label: "教官",
            searchLabel: "教官管理",
            to: "/teachers",
            roles: ["admin"],
            searchCategory: "管理",
            searchKeywords: ["先生", "教官", "新規登録"],
          },
        ],
      },
      {
        id: "classroom",
        label: "クラス",
        searchLabel: "クラス管理",
        icon: "classRoom",
        to: "/classrooms",
        roles: ["admin"],
        searchCategory: "管理",
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
    ],
  },
  {
    label: "削除予定",
    items: [
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
        searchCategory: "管理",
      },
    ],
  },
] satisfies NavigationSectionConfig[];
