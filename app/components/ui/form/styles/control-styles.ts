import { cva } from "~/lib/cva";

export const disabledControlTextStyle =
  "disabled:cursor-not-allowed disabled:text-text-subtle disabled:opacity-100";

export const disabledControlStyle = `${disabledControlTextStyle} disabled:bg-surface-muted disabled:shadow-none dark:disabled:bg-surface-subtle`;

export const controlSurfaceStyle = cva("app-rounded border", {
  variants: {
    borderTone: {
      base: "border-border-base",
      strong: "border-border-strong",
    },
    disabled: {
      false: "bg-surface-base",
      true: "bg-surface-muted dark:bg-surface-subtle",
    },
  },
  defaultVariants: {
    borderTone: "base",
    disabled: "false",
  },
});

export function textInputStyle() {
  return `${controlSurfaceStyle()} text-text-base placeholder:text-text-subtle focus:border-border-strong h-9 w-full px-3 text-sm outline-none transition-colors ${disabledControlStyle} disabled:resize-none`;
}
