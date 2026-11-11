import { createPageTitle } from "~/lib/page-title";
import { httpEventCommandGateway } from "~/features/events/api/http/event-dependencies";
import { EventCreatePage } from "~/features/events/pages/EventCreatePage";
import { httpVenueReader } from "~/features/venues/api/http/venue-dependencies";

export function meta() {
  return [{ title: createPageTitle("イベントの新規登録") }];
}

export default function EventCreateRoute() {
  return (
    <EventCreatePage
      commandGateway={httpEventCommandGateway}
      venueReader={httpVenueReader}
    />
  );
}
