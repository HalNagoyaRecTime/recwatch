import { createPageTitle } from "~/lib/page-title";
import { SidebarPlaceholderPage } from "~/features/admin-pages/components/SidebarPlaceholderPage";

export function meta() {
  return [{ title: createPageTitle("ランキング") }];
}

export default function RankingRoute() {
  return <SidebarPlaceholderPage title="ランキング" />;
}
