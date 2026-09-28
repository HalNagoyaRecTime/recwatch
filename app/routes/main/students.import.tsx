import { MasterImportConfirmationPage } from "~/features/master-import/pages/MasterImportConfirmationPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("取り込み確認") }];
}

export default function StudentsImportRoute() {
  return <MasterImportConfirmationPage fallbackListPath="/students" />;
}
