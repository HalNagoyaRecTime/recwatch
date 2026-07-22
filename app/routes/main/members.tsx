import { MembersPage } from "~/features/members/pages/MembersPage";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export default function MembersRoute() {
  return <MembersPage />;
}
