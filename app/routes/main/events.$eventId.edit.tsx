import { createPageTitle } from "~/lib/page-title";
import { EventEditPage } from "~/features/events/pages/EventEditPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベント 編集") }];
}

export default function EventEditRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <EventEditPage />
      </PagePadding>
    </PageLayout>
  );
}
