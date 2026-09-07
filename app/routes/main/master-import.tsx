import { createPageTitle } from "~/lib/page-title";
import { MasterImportConfirmationPage } from "~/features/master-import/pages/MasterImportConfirmationPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("取り込み確認") }];
}

export default function MasterImportRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <MasterImportConfirmationPage />
      </PagePadding>
    </PageLayout>
  );
}
