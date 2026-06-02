import type { AppRole } from "./permissions";

export type NavIconKey =
  | "calendar"
  | "clock"
  | "dashboard"
  | "file"
  | "settings"
  | "timing"
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
        id: "events",
        label: "Events",
        icon: "calendar",
        badge: 3,
        roles: ["admin", "manager", "member"],
        children: [
          {
            id: "events-active",
            label: "Active Events",
            to: "/events/active",
            roles: ["admin", "manager", "member"],
          },
          {
            id: "events-past",
            label: "Past Events",
            to: "/events/past",
            roles: ["admin", "manager"],
          },
          {
            id: "events-new",
            label: "Create Event",
            to: "/events/new",
            badge: "Beta",
            roles: ["admin", "manager"],
          },
        ],
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
            id: "members-teams",
            label: "Teams",
            to: "/members/teams",
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
        id: "timing",
        label: "Timing Control",
        icon: "timing",
        to: "/timing",
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
      {
        id: "reports",
        label: "Reports",
        icon: "file",
        roles: ["admin", "manager"],
        children: [
          {
            id: "reports-summary",
            label: "Summary",
            to: "/reports/summary",
            roles: ["admin", "manager"],
          },
          {
            id: "reports-detail",
            label: "Detail",
            to: "/reports/detail",
            roles: ["admin"],
          },
          {
            id: "reports-export",
            label: "Export",
            to: "/reports/export",
            roles: ["admin"],
          },
        ],
      },
      {
        id: "schedule",
        label: "Schedule",
        icon: "clock",
        to: "/schedule",
        roles: ["admin", "manager", "member"],
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
