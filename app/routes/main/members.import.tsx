import { MembersImportConfirmationPage } from "~/features/members/pages/MembersImportConfirmationPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "取り込み確認 | recwatch" }];
}

export default function MembersImportRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <MembersImportConfirmationPage />
      </PagePadding>
    </PageLayout>
  );
}
