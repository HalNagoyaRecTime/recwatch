import { MembersPage } from "~/features/members/pages/MembersPage";
import { getStudentsData } from "~/features/members/model/students-data";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export default function MembersRoute() {
  return <MembersPage students={getStudentsData()} />;
}
