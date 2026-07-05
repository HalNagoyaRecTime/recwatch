import { cva } from "~/lib/cva";

export const SIDEBAR_DURATION_MS = 200;
export const SIDEBAR_DURATION = "duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]";

export const sidebarPlaceholderStyle = cva(
  "relative z-99 overflow-visible transition-[width] " + SIDEBAR_DURATION,
  {
    variants: {
      isOpen: {
        true: "sidebar-open-width",
        false: "sidebar-close-width",
      },
    },
  }
);

export const sidebarContainerStyle = cva(
  "navigation-expandable absolute z-99 flex h-full flex-col border-r bg-(--surface-overlay) backdrop-blur-xl border-(--border-1) transition-[width] " +
    SIDEBAR_DURATION,
  {
    variants: {
      isExpanded: {
        true: "sidebar-open-width",
        false: "sidebar-close-width",
      },
    },
  }
);
