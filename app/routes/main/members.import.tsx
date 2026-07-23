import { MembersImportConfirmationPage } from "~/features/members/pages/MembersImportConfirmationPage";

export function meta() {
  return [{ title: "取り込み確認 | recwatch" }];
}

export default function MembersImportRoute() {
  return <MembersImportConfirmationPage />;
}
