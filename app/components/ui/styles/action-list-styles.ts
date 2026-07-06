import { cva } from "~/lib/cva";

export const actionListContainerStyle =
  "border-border-2 bg-surface-overlay-strong shadow-soft min-w-max rounded-xl border p-2 backdrop-blur-xl";

export const actionListItemStyle = cva(
  "relative flex h-8.5 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition",
  {
    variants: {
      intent: {
        primary: "text-text-1 hover:bg-surface-2",
        danger: "text-tone-danger-text hover:bg-tone-danger-bg-hover",
      },
      active: {
        true: "bg-surface-brand-soft text-text-1",
        false: "",
      },
    },
    defaultVariants: {
      intent: "primary",
      active: "false",
    },
  }
);
