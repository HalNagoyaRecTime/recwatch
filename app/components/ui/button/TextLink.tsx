import { Link, type LinkProps } from "react-router";

import { textLinkStyle } from "~/components/ui/button/styles/text-link-styles";

type TextLinkProps = Omit<LinkProps, "children" | "className" | "onClick"> & {
  children: string;
  variant?: "pill" | "inline";
};

export function TextLink({ children, variant, ...props }: TextLinkProps) {
  return (
    <Link {...props} className={textLinkStyle({ variant })}>
      <span className="truncate">{children}</span>
    </Link>
  );
}
