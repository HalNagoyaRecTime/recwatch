import { createPageTitle } from "~/lib/page-title";
import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("Detail Report") }];
}

export default function ReportsDetailRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <AdminPlaceholderPage {...pageContent.reportsDetail} />
      </PagePadding>
    </PageLayout>
  );
}
