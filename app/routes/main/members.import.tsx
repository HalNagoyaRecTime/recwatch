import { createPageTitle } from "~/config/app";
import { MembersImportConfirmationPage } from "~/features/members/pages/MembersImportConfirmationPage";
import { MembersPage } from "~/features/members/pages/MembersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("取り込み確認") }];
}

export default function MembersImportRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <MembersPage />
        <MembersImportConfirmationPage />
      </PagePadding>
    </PageLayout>
  );
}
