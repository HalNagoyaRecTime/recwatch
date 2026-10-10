import { createPageTitle } from "~/lib/page-title";
import { EventGatheringSettingsPage } from "~/features/event-gatherings/pages/EventGatheringSettingsPage";

export function meta() {
  return [{ title: createPageTitle("集合設定") }];
}

export default function EventGatheringSettingsRoute() {
  return <EventGatheringSettingsPage />;
}
