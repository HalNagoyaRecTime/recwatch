import type { ReactNode } from "react";

type PagePaddingProps = {
  children: ReactNode;
};

export function PagePadding({ children }: PagePaddingProps) {
  return <div className="px-5 py-6 md:px-10 md:py-6">{children}</div>;
}
