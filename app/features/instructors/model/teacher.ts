import type { TeacherDTO } from "~/features/instructors/api";

export type TeacherClassRoomRow = {
  classRoomId: number;
  className: string;
};

export type TeacherRow = {
  teacherId: number;
  teacherCode: string;
  displayName: string;
  classRooms: TeacherClassRoomRow[];
};

function toTeacherCode(teacherId: number): string {
  return `NH-STAFF${String(teacherId).padStart(2, "0")}`;
}

export function toTeacherRow(dto: TeacherDTO): TeacherRow {
  return {
    teacherId: dto.teacher_id,
    teacherCode: toTeacherCode(dto.teacher_id),
    displayName: dto.display_name,
    classRooms: dto.class_rooms.map((c) => ({
      classRoomId: c.class_room_id,
      className: c.class_name,
    })),
  };
}
