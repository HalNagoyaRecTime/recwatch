import { CompetitionEditPage } from "~/features/sports/pages/CompetitionEditPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "イベント 編集 | recwatch" }];
}

export default function CompetitionEditRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <CompetitionEditPage />
      </PagePadding>
    </PageLayout>
  );
}
