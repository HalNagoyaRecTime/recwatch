import { cva } from "~/lib/cva";

export const NAV_DURATION_MS = 200;
export const NAV_DURATION = "duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]";

export const sidebarPlaceholderStyle = cva(
  "relative z-99 overflow-visible transition-[width] " + NAV_DURATION,
  {
    variants: {
      isOpen: {
        true: "navigation-open-width",
        false: "navigation-close-width",
      },
    },
  }
);

export const sidebarContainerStyle = cva(
  "navigation-expandable absolute z-99 flex h-full flex-col border-r bg-(--surface-overlay) backdrop-blur-xl border-(--border-1) transition-[width] " +
    NAV_DURATION,
  {
    variants: {
      isExpanded: {
        true: "navigation-open-width",
        false: "navigation-close-width",
      },
    },
  }
);
