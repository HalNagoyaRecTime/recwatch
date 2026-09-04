import { createPageTitle } from "~/lib/page-title";
import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("Timing") }];
}

export default function TimingRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <AdminPlaceholderPage {...pageContent.timing} />
      </PagePadding>
    </PageLayout>
  );
}
