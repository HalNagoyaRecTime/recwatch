import { createPageTitle } from "~/lib/page-title";
import { SidebarPlaceholderPage } from "~/features/admin-pages/components/SidebarPlaceholderPage";

export function meta() {
  return [{ title: createPageTitle("学生CSV取り込み") }];
}

export default function StudentsImportRoute() {
  return <SidebarPlaceholderPage title="学生CSV取り込み" />;
}
