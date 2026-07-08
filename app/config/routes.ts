import type { AppRole } from "./permissions";

export type SidebarIconKey =
  | "calendar"
  | "clock"
  | "dashboard"
  | "file"
  | "home"
  | "settings"
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
    label: "分析",
    items: [
      {
        id: "reports",
        label: "レポート",
        icon: "file",
        roles: ["admin", "manager"],
        children: [
          {
            id: "reports-summary",
            label: "サマリー",
            roles: ["admin", "manager"],
            children: [
              {
                id: "reports-summary-daily",
                label: "日次レポート",
                to: "/reports/summary/daily",
                roles: ["admin", "manager"],
              },
              {
                id: "reports-summary-monthly",
                label: "月次レポート",
                to: "/reports/summary/monthly/department",
                roles: ["admin", "manager"],
              },
            ],
          },
          {
            id: "reports-detail",
            label: "詳細",
            to: "/reports/detail",
            roles: ["admin"],
          },
          {
            id: "reports-export",
            label: "エクスポート",
            to: "/reports/export",
            roles: ["admin"],
          },
        ],
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
            id: "events-active",
            label: "開催中",
            to: "/events/active",
            roles: ["admin", "manager", "member"],
          },
          {
            id: "events-past",
            label: "過去のイベント",
            to: "/events/past",
            roles: ["admin", "manager"],
          },
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
            id: "members-teams",
            label: "チーム",
            to: "/members/teams",
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
            label: "トーナメント",
            to: "/sports/tournament",
            roles: ["admin"],
          },
          {
            id: "sports-scoring",
            label: "採点ルール",
            to: "/sports/scoring",
            roles: ["admin", "manager"],
          },
          {
            id: "homeroom",
            label: "ホームルーム",
            to: "/homeroom",
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
        id: "timing",
        label: "計測コントロール",
        icon: "timing",
        to: "/timing",
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
