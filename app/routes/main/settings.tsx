import { SettingsPage } from "~/features/settings/pages/SettingsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "設定 | recwatch" }];
}

export default function SettingsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <SettingsPage />
      </PagePadding>
    </PageLayout>
  );
}
