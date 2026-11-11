import { createPageTitle } from "~/lib/page-title";
import {
  httpEventCommandGateway,
  httpEventQueryGateway,
} from "~/features/events/api/http/event-dependencies";
import { EventListPage } from "~/features/events/pages/EventListPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベント管理") }];
}

export default function EventsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <EventListPage
          commandGateway={httpEventCommandGateway}
          queryGateway={httpEventQueryGateway}
        />
      </PagePadding>
    </PageLayout>
  );
}
