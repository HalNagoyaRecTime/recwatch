import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  buttonIconStyle,
  buttonStyle,
} from "~/components/ui/button/styles/button-styles";

type ButtonBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
};

type LabeledButtonProps = ButtonBaseProps & {
  iconOnly?: false;
  children: ReactNode;
};

type IconOnlyButtonProps = ButtonBaseProps & {
  iconOnly: true;
  icon: LucideIcon;
  children?: never;
  "aria-label": string;
};

export type ButtonProps = LabeledButtonProps | IconOnlyButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      icon: Icon,
      variant = "secondary",
      size = "md",
      iconOnly = false,
      type = "button",
      children,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        {...props}
        type={type}
        className={buttonStyle({
          variant,
          size,
          layout: iconOnly ? "icon" : "content",
        })}
      >
        {Icon && (
          <Icon aria-hidden="true" className={buttonIconStyle({ variant })} />
        )}
        {!iconOnly && <span className="truncate">{children}</span>}
      </button>
    );
  }
);
