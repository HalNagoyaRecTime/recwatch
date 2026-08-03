import type { ReactNode } from "react";

type PagePaddingProps = {
  children: ReactNode;
};

export function PagePadding({ children }: PagePaddingProps) {
  return <div className="p-4.5 md:p-6">{children}</div>;
}
