import { cva } from "~/lib/cva";

export const SIDEBAR_DURATION = "duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]";

export const sidebarPlaceholderStyle = cva(
  "relative z-99 sticky top-0 h-screen h-dvh overflow-visible transition-[width] " +
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

export const sidebarMobileDialogStyle =
  "mobile-sidebar-dialog fixed inset-y-0 left-0 right-auto z-99 m-0 flex h-screen h-dvh max-h-none w-72 flex-col overflow-hidden border-r border-border-subtle bg-surface-base p-0 text-text-base transition-transform " +
  SIDEBAR_DURATION;
