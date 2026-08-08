import type { TeacherDTO } from "~/features/teachers/api/dto/teacher-dto";
import type { TeacherRow } from "~/features/teachers/model/teacher";

export function toTeacherRow(dto: TeacherDTO): TeacherRow {
  return {
    teacherId: dto.teacher_id,
    displayName: dto.display_name,
    isLiveActive: dto.is_live_active,
    classRooms: dto.class_rooms.map((classRoom) => ({
      classRoomId: classRoom.class_room_id,
      classCode: classRoom.class_code,
      className: classRoom.class_name,
    })),
  };
}
