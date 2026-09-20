import type {
  StudentDTO,
  StudentPageDTO,
} from "~/features/students/api/dto/student-dto";
import type {
  StudentPage,
  StudentRow,
} from "~/features/students/model/student";

export function toStudentRow(dto: StudentDTO): StudentRow {
  return {
    studentId: dto.student_id,
    userId: dto.user_id,
    displayName: dto.display_name,
    studentIdNumber: dto.student_id_number,
    attendanceNumber: dto.attendance_number,
    isLiveActive: dto.is_live_active,
    isStaff: dto.is_staff,
    classRoom: {
      classRoomId: dto.class_room.class_room_id,
      classCode: dto.class_room.class_code,
      className: dto.class_room.class_name,
    },
  };
}

export function toStudentPage(dto: StudentPageDTO): StudentPage {
  return {
    items: dto.items.map(toStudentRow),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}
