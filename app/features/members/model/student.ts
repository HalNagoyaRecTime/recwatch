import type { StudentDTO } from "~/features/members/api";

export type Student = {
  id: string;
  displayName: string;
  attendanceNumber: string;
  studentIdNumber: string;
  uid: string;
};

export function toStudent(dto: StudentDTO): Student {
  return {
    id: String(dto.student_id),
    displayName: dto.display_name,
    attendanceNumber: String(dto.attendance_number),
    studentIdNumber: dto.student_id_number,
    uid: dto.uid,
  };
}
