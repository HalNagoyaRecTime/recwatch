import { MembersPage } from "~/features/members/pages/MembersPage";
import { mockStudents } from "~/features/members/mocks/students";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export default function MembersRoute() {
  return <MembersPage students={mockStudents} />;
}
