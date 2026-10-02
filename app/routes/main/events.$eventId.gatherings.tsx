import { createPageTitle } from "~/lib/page-title";
import {
  httpEventGatheringSettingsGateway,
  httpGatheringMemberGateway,
} from "~/features/events/api/http/event-dependencies";
import { EventGatheringSettingsPage } from "~/features/events/pages/EventGatheringSettingsPage";
import { httpGatheringSpotReader } from "~/features/gathering-spots/api/http/gathering-spot-dependencies";

export function meta() {
  return [{ title: createPageTitle("集合設定") }];
}

export default function EventGatheringSettingsRoute() {
  return (
    <EventGatheringSettingsPage
      memberGateway={httpGatheringMemberGateway}
      settingsGateway={httpEventGatheringSettingsGateway}
      spotReader={httpGatheringSpotReader}
    />
  );
}
