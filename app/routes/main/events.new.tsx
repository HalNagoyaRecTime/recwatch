import { createPageTitle } from "~/lib/page-title";
import { EventCreatePage } from "~/features/events/pages/EventCreatePage";

export function meta() {
  return [{ title: createPageTitle("イベントの新規登録") }];
}

export default function EventCreateRoute() {
  return <EventCreatePage />;
}
