import { MembersPage } from "~/features/members/pages/MembersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "Member List | recwatch" }];
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
