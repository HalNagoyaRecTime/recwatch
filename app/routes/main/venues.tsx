import { createPageTitle } from "~/lib/page-title";
import { httpVenueGateway } from "~/features/venues/api/http/venue-dependencies";
import { VenuesPage } from "~/features/venues/pages/VenuesPage";

export function meta() {
  return [{ title: createPageTitle("実施場所管理") }];
}

export default function VenuesRoute() {
  return <VenuesPage gateway={httpVenueGateway} />;
}
