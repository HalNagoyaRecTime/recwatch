import { MembersPage } from "~/features/members/pages/MembersPage";
import type { Student } from "~/features/members/model/student";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

const students: Student[] = [
  { id: "1", display_name: "Taro Yamada", uid: "0000-0000-0000" },
  { id: "2", display_name: "Jiro Yamada", uid: "0000-0000-0001" },
];

export default function MembersRoute() {
  return <MembersPage students={students} />;
}
