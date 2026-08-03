import { CompetitionAssignmentPage } from "~/features/sports/pages/CompetitionAssignmentPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "競技割り当て | recwatch" }];
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
