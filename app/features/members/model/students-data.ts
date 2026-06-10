import type { Student } from "~/features/members/model/student";
import membersJson from "~/mock/members.json";

type StudentMock = {
  id: string;
  displayName: string;
  attendanceNumber: string;
  studentIdNumber: string;
  uid: string;
};

export function getStudentsData(): Student[] {
  return (membersJson as StudentMock[]).map((s) => ({
    id: s.id,
    displayName: s.displayName,
    attendanceNumber: s.attendanceNumber,
    studentIdNumber: s.studentIdNumber,
    uid: s.uid,
  }));
}
