import { MembersPage } from "~/features/members/pages/MembersPage";
import type { Student } from "~/features/members/model/student";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

const students: Student[] = [
  {
    id: "1",
    display_name: "Taro Yamada",
    student_id: "10001",
    attendance_number: "01",
    student_id_number: "24001",
    uid: "0000-0000-0000",
  },
  {
    id: "2",
    display_name: "Jiro Yamada",
    student_id: "10002",
    attendance_number: "02",
    student_id_number: "24002",
    uid: "0000-0000-0001",
  },
  {
    id: "3",
    display_name: "Saburo Yamada",
    student_id: "10003",
    attendance_number: "03",
    student_id_number: "24003",
    uid: "0000-0000-0002",
  },
  {
    id: "4",
    display_name: "Shiro Yamada",
    student_id: "10004",
    attendance_number: "04",
    student_id_number: "24004",
    uid: "0000-0000-0003",
  },
];

export default function MembersRoute() {
  return <MembersPage students={students} />;
}
