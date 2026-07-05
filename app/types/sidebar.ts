import type { ReactNode } from "react";

import type { AppRole } from "~/config/permissions";

export type SidebarChildDef = {
  id: string;
  label: string;
  to: string;
  roles: AppRole[];
};

export type SidebarItemDef = {
  id: string;
  label: string;
  icon: ReactNode;
  to?: string;
  children?: SidebarChildDef[];
  roles: AppRole[];
};

export type SidebarSectionDef = {
  label?: string;
  hasDivider?: boolean;
  items: SidebarItemDef[];
};
