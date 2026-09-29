import { createPageTitle } from "~/lib/page-title";
import { MasterImportConfirmationPage } from "~/features/master-import/pages/MasterImportConfirmationPage";
import { StudentsPage } from "~/features/students/pages/StudentsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("取り込み確認") }];
}

export default function StudentsImportRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <StudentsPage />
        <MasterImportConfirmationPage fallbackListPath="/students" />
      </PagePadding>
    </PageLayout>
  );
}
