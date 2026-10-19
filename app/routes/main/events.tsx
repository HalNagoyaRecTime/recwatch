import { createPageTitle } from "~/lib/page-title";
import { EventListPage } from "~/features/events/pages/EventListPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベント登録一覧") }];
}

export default function EventsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <EventListPage />
      </PagePadding>
    </PageLayout>
  );
}
