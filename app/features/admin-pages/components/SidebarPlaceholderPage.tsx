import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

type SidebarPlaceholderPageProps = {
  title: string;
};

export function SidebarPlaceholderPage({ title }: SidebarPlaceholderPageProps) {
  return (
    <PageLayout>
      <PagePadding>
        <h1 className="text-text-base text-xl font-semibold">{title}ページ</h1>
      </PagePadding>
    </PageLayout>
  );
}
