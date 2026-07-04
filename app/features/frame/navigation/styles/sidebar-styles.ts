import { cva } from "~/lib/cva";

export const sidebarPlaceholderStyle = cva(
  "relative z-99 overflow-visible transition-[width] duration-200 ease-in-out",
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
  "navigation-expandable absolute z-99 flex h-full flex-col border-r bg-(--surface-overlay) backdrop-blur-xl transition-[width] duration-200 ease-in-out border-(--border-1)",
  {
    variants: {
      isExpanded: {
        true: "navigation-open-width",
        false: "navigation-close-width",
      },
    },
  }
);
