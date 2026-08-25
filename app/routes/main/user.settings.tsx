import { createPageTitle } from "~/config/app";
import { UserSettingsPage } from "~/features/user/pages/UserSettingsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("ユーザー設定") }];
}

export default function UserSettingsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <UserSettingsPage />
      </PagePadding>
    </PageLayout>
  );
}
