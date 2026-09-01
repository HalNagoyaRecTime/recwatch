import { createPageTitle } from "~/lib/page-title";
import { SettingsPage } from "~/features/settings/pages/SettingsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("設定") }];
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
