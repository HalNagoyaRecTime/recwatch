import { createPageTitle } from "~/lib/page-title";
import { CompetitionAssignmentPage } from "~/features/sports/pages/CompetitionAssignmentPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("参加者設定") }];
}

export default function CompetitionAssignmentRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <CompetitionAssignmentPage />
      </PagePadding>
    </PageLayout>
  );
}
