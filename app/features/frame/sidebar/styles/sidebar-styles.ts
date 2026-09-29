import { cva } from "~/lib/cva";

export const SIDEBAR_DURATION = "duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]";

export const sidebarPlaceholderStyle = cva(
  "sidebar-viewport-height relative z-99 sticky top-0 overflow-visible transition-[width] " +
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
  "absolute z-99 flex h-full flex-col border-r bg-surface-layout backdrop-blur-xl border-border-subtle transition-[width] " +
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

// 固定Drawerの外枠は透明に保ち、背景色は下safe-areaを避けた内側の面だけに付ける。
export const sidebarMobileContainerStyle =
  "sidebar-viewport-height fixed top-0 left-0 z-99 w-72 bg-transparent transition-[translate] " +
  SIDEBAR_DURATION;

// 不透明な面なのでblurは不要。Desktop Sidebarの半透明面とは分けて扱う。
export const sidebarMobileSurfaceStyle =
  "mobile-safe-area-visual pointer-events-none absolute inset-x-0 top-0 border-r border-border-subtle bg-surface-base";
