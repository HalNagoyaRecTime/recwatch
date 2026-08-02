import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, type LinkProps } from "react-router";

import {
  buttonIconStyle,
  buttonStyle,
} from "~/components/ui/button/styles/button-styles";

type ButtonLinkBaseProps = Omit<
  LinkProps,
  "children" | "className" | "onClick"
> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
};

type LabeledButtonLinkProps = ButtonLinkBaseProps & {
  iconOnly?: false;
  children: ReactNode;
};

type IconOnlyButtonLinkProps = ButtonLinkBaseProps & {
  iconOnly: true;
  icon: LucideIcon;
  children?: never;
  "aria-label": string;
};

export type ButtonLinkProps = LabeledButtonLinkProps | IconOnlyButtonLinkProps;

export function ButtonLink({
  icon: Icon,
  variant = "secondary",
  size = "md",
  iconOnly = false,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
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
    </Link>
  );
}
