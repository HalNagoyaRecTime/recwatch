import { cva } from "~/lib/cva";

export const sidebarPlaceholderStyle = cva(
  "relative z-99 overflow-visible transition-[width] duration-200 ease-in-out",
  {
    variants: {
      isOpen: {
        true: "left-navigation-open-width",
        false: "left-navigation-close-width",
      },
    },
  }
);

export const sidebarContainerStyle = cva(
  "left-navigation-expandable absolute z-99 flex h-full flex-col border-r bg-(--surface-overlay) backdrop-blur-xl transition-[width] duration-200 ease-in-out border-(--border-1)",
  {
    variants: {
      isExpanded: {
        true: "left-navigation-open-width",
        false: "left-navigation-close-width",
      },
    },
  }
);
