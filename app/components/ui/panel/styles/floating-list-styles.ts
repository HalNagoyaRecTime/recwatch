import { cva } from "~/lib/cva";

export const floatingListSurfaceStyle = cva(
  "border-border-base bg-surface-base app-rounded border p-2 shadow-soft"
);

export const floatingListActionItemStyle = cva(
  "flex h-8.5 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      intent: {
        default: "text-text-base hover:bg-surface-hover",
        danger: "text-tone-danger-text hover:bg-tone-danger-bg-hover",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
);

export const floatingListOptionStyle = cva(
  "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 text-left text-sm text-text-base transition-colors hover:bg-surface-hover",
  {
    variants: {
      selected: {
        true: "bg-surface-muted",
        false: "",
      },
    },
    defaultVariants: {
      selected: "false",
    },
  }
);
