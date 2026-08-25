import { createPageTitle } from "~/config/app";
import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("Past Events") }];
}

export default function EventsPastRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <AdminPlaceholderPage {...pageContent.eventsPast} />
      </PagePadding>
    </PageLayout>
  );
}
