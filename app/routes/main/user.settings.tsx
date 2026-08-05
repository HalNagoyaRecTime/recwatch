import { UserSettingsPage } from "~/features/user/pages/UserSettingsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "ユーザー設定 | recwatch" }];
}

export default function SettingsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <UserSettingsPage />
      </PagePadding>
    </PageLayout>
  );
}
