import { createPageTitle } from "~/lib/page-title";
import { SidebarPlaceholderPage } from "~/features/admin-pages/components/SidebarPlaceholderPage";

export function meta() {
  return [{ title: createPageTitle("本日の進行") }];
}

export default function EventsTodayRoute() {
  return <SidebarPlaceholderPage title="本日の進行" />;
}
