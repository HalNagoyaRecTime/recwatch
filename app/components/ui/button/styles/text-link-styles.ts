import { cva } from "~/lib/cva";

export const textLinkStyle = cva(
  "inline-flex max-w-full min-w-0 items-center text-sm text-text-base transition-colors",
  {
    variants: {
      variant: {
        pill: "h-8 rounded-full bg-transparent px-3 hover:bg-surface-hover",
        inline: "hover:underline underline-offset-2",
      },
    },
    defaultVariants: { variant: "pill" },
  }
);
