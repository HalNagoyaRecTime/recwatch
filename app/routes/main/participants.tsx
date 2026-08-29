import { ParticipantsPage } from "~/features/participants/pages/ParticipantsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "出場メンバー管理 | recwatch" }];
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
