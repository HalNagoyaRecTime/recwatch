import { createPageTitle } from "~/lib/page-title";
import { SidebarPlaceholderPage } from "~/features/admin-pages/components/SidebarPlaceholderPage";

export function meta() {
  return [{ title: createPageTitle("チーム") }];
}

export default function TeamsRoute() {
  return <SidebarPlaceholderPage title="チーム" />;
}
