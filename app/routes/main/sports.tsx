import { createPageTitle } from "~/config/app";
import { CompetitionListPage } from "~/features/sports/pages/CompetitionListPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("イベント登録一覧") }];
}

export default function SportsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <CompetitionListPage />
      </PagePadding>
    </PageLayout>
  );
}
