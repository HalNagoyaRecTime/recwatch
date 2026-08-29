import { Link, type LinkProps } from "react-router";

import { textLinkStyle } from "~/components/ui/button/styles/text-link-styles";

type TextLinkProps = Omit<LinkProps, "children" | "className" | "onClick"> & {
  children: string;
};

export function TextLink({ children, ...props }: TextLinkProps) {
  return (
    <Link {...props} className={textLinkStyle}>
      <span className="truncate">{children}</span>
    </Link>
  );
}
