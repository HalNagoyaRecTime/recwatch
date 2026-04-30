import type { ReactNode } from "react";

import type { AppRole } from "~/config/permissions";

export type NavChildDef = {
  id: string;
  label: string;
  to: string;
  badge?: string;
  roles: AppRole[];
};

export type NavItemDef = {
  id: string;
  label: string;
  icon: ReactNode;
  to?: string;
  badge?: number | string;
  children?: NavChildDef[];
  roles: AppRole[];
};

export type NavSectionDef = {
  label: string;
  items: NavItemDef[];
};
