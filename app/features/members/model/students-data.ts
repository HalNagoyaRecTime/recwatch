import type { Student } from "~/features/members/model/student";
import { toStudent } from "~/features/members/model/student";
import membersJson from "~/mock/members.json";
import { membersApi } from "~/features/members/api";

const USE_MOCK = false;

type StudentMock = {
  id: string;
  displayName: string;
  attendanceNumber: string;
  studentIdNumber: string;
  uid: string;
};

export async function getStudentsData(): Promise<Student[]> {
  if (USE_MOCK) {
    return (membersJson as StudentMock[]).map((s) => ({
      id: s.id,
      displayName: s.displayName,
      attendanceNumber: s.attendanceNumber,
      studentIdNumber: s.studentIdNumber,
      uid: s.uid,
    }));
  }
  const dtos = await membersApi.getStudents();
  return dtos.map(toStudent);
}
