import type { ReactNode } from "react";

import MainFooter from "~/features/frame/main-header/components/MainFooter";

type ListPageLayoutProps = {
  children: ReactNode;
};

/** 一覧を画面の残りの高さに収め、ページ全体のスクロールを防ぎます。 */
export function ListPageLayout({ children }: ListPageLayoutProps) {
  return (
    <div className="list-page-layout flex min-h-0 flex-none flex-col overflow-hidden">
      <div className="page-padding flex min-h-0 flex-1 flex-col py-6">
        {children}
      </div>
      <MainFooter />
    </div>
  );
}
