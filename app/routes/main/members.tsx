import { createPageTitle } from "~/config/app";
import { MembersPage } from "~/features/members/pages/MembersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("学生管理") }];
}

export default function MembersRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <MembersPage />
      </PagePadding>
    </PageLayout>
  );
}
