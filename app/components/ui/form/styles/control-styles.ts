import { cva } from "~/lib/cva";

export const controlSurfaceStyle = cva("app-rounded bg-surface-base border", {
  variants: {
    borderTone: {
      base: "border-border-base",
      strong: "border-border-strong",
    },
  },
  defaultVariants: {
    borderTone: "base",
  },
});
