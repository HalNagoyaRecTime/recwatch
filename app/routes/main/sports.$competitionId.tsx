import { createPageTitle } from "~/lib/page-title";
import { EventDetailPage } from "~/features/sports/pages/EventDetailPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベント詳細") }];
}

export default function EventDetailRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <EventDetailPage />
      </PagePadding>
    </PageLayout>
  );
}
