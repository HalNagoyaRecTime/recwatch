import { CompetitionCreatePage } from "~/features/sports/pages/CompetitionCreatePage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "イベントの新規登録 | recwatch" }];
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
