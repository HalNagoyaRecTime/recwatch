import type { ReactNode } from "react";

import type { AppRole } from "~/config/permissions";

export type SidebarItemDef = {
  id: string;
  label: string;
  icon?: ReactNode;
  to?: string;
  children?: SidebarItemDef[];
  roles: AppRole[];
};

export type SidebarSectionDef = {
  label?: string;
  hasDivider?: boolean;
  items: SidebarItemDef[];
};
