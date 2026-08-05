import { UserSettingsPage } from "~/features/user/pages/UserSettingsPage";

export function meta() {
  return [{ title: "ユーザー設定 | recwatch" }];
}

export default function SettingsRoute() {
  return <UserSettingsPage />;
}
