import type { ReactNode } from "react";

type PagePaddingProps = {
  children: ReactNode;
};

export function PagePadding({ children }: PagePaddingProps) {
  return <div className="page-padding">{children}</div>;
}
