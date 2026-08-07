import { cva } from "~/lib/cva";

export const actionListContainerStyle =
  "border-border-base bg-surface-base shadow-soft min-w-max rounded-xl border p-2 backdrop-blur-xl";

export const actionListItemStyle = cva(
  "relative flex h-8.5 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors",
  {
    variants: {
      intent: {
        primary: "text-text-base hover:bg-surface-hover",
        nav: "text-text-muted hover:bg-surface-hover hover:text-text-base",
        danger: "text-tone-danger-text hover:bg-tone-danger-bg-hover",
      },
      active: {
        true: "bg-surface-hover text-text-base font-medium",
        false: "",
      },
    },
    defaultVariants: {
      intent: "primary",
      active: "false",
    },
  }
);
