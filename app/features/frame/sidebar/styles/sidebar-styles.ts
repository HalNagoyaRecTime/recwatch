import { cva } from "~/lib/cva";

export const SIDEBAR_DURATION = "duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]";

export const sidebarPlaceholderStyle = cva(
  "relative z-99 h-full overflow-visible transition-[width] " +
    SIDEBAR_DURATION,
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
  "navigation-expandable absolute z-99 flex h-full flex-col border-r bg-surface-layout backdrop-blur-xl border-border-subtle transition-[width] " +
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

export const sidebarMobileContainerStyle =
  "fixed inset-y-0 left-0 z-99 flex w-72 flex-col border-r bg-surface-layout backdrop-blur-xl border-border-subtle transition-transform " +
  SIDEBAR_DURATION;

export const sidebarMobileBackplateStyle =
  "pointer-events-none fixed inset-y-0 left-0 z-98 w-72 bg-surface-base transition-transform " +
  SIDEBAR_DURATION;
