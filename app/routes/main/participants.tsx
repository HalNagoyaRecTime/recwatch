import { createPageTitle } from "~/lib/page-title";
import { ParticipantsPage } from "~/features/participants/pages/ParticipantsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("出場メンバー管理") }];
}

export default function ParticipantsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <ParticipantsPage />
      </PagePadding>
    </PageLayout>
  );
}
