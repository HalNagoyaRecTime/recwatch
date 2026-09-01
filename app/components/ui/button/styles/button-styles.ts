import { cva } from "~/lib/cva";

export const buttonStyle = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "app-rounded bg-[linear-gradient(135deg,var(--button-brand-gradient-start),var(--button-brand-gradient-end))] text-text-base-inverse font-semibold shadow-sm hover:brightness-105",
        secondary:
          "app-rounded border border-border-base bg-surface-base text-text-muted font-medium hover:border-border-strong hover:text-text-base",
        ghost:
          "app-rounded bg-transparent text-text-muted font-medium hover:bg-surface-hover hover:text-text-base",
        danger:
          "app-rounded bg-tone-danger-surface text-tone-danger-text font-medium hover:brightness-95",
        success:
          "app-rounded border border-tone-success-border bg-tone-success-bg text-tone-success-text font-semibold shadow-sm hover:bg-tone-success-bg-hover",
      },
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-sm",
      },
      layout: {
        content: "",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      layout: "content",
    },
    compoundVariants: [
      {
        size: "sm",
        layout: "content",
        className: "h-8 gap-1.5 px-3",
      },
      {
        size: "md",
        layout: "content",
        className: "h-9 gap-2 px-3.5",
      },
      {
        size: "lg",
        layout: "content",
        className: "h-11 gap-2 px-4",
      },
      {
        size: "sm",
        layout: "icon",
        className: "size-8 p-0",
      },
      {
        size: "md",
        layout: "icon",
        className: "size-9 p-0",
      },
      {
        size: "lg",
        layout: "icon",
        className: "size-11 p-0",
      },
    ],
  }
);

export const buttonIconStyle = cva("shrink-0", {
  variants: {
    variant: {
      primary: "size-5 stroke-[2.5]",
      secondary: "size-4",
      ghost: "size-4",
      danger: "size-4",
      success: "size-5 stroke-[2.5]",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});
