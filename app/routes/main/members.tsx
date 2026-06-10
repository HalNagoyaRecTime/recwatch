import { MembersPage } from "~/features/members/pages/MembersPage";
import type { Student } from "~/features/members/model/student";
import membersJson from "~/mock/members.json";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export default function MembersRoute() {
  return <MembersPage students={membersJson as Student[]} />;
}
