import { createPageTitle } from "~/lib/page-title";
import {
  httpEventCommandGateway,
  httpEventQueryGateway,
} from "~/features/events/api/http/event-dependencies";
import { EventEditPage } from "~/features/events/pages/EventEditPage";
import { httpVenueReader } from "~/features/venues/api/http/venue-dependencies";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベント 編集") }];
}

export default function EventEditRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <EventEditPage
          commandGateway={httpEventCommandGateway}
          queryGateway={httpEventQueryGateway}
          venueReader={httpVenueReader}
        />
      </PagePadding>
    </PageLayout>
  );
}
