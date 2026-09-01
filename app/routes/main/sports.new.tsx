import { createPageTitle } from "~/lib/page-title";
import { CompetitionCreatePage } from "~/features/sports/pages/CompetitionCreatePage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベントの新規登録") }];
}

export default function CompetitionCreateRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <CompetitionCreatePage />
      </PagePadding>
    </PageLayout>
  );
}
