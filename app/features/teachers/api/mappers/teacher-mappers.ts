import type { TeacherRow } from "../../model/teacher";
import type { TeacherDTO } from "../dto/teacher-dto";

export function toTeacherRow(dto: TeacherDTO): TeacherRow {
  return {
    teacherId: dto.teacher_id,
    displayName: dto.display_name,
    isLiveActive: dto.is_live_active,
    isStaff: dto.is_staff,
    classRooms: dto.class_rooms.map((classRoom) => ({
      classRoomId: classRoom.class_room_id,
      classCode: classRoom.class_code,
      className: classRoom.class_name,
    })),
  };
}
