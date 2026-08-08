import type { TeacherDTO } from "~/features/teachers/api";

export type TeacherClassRoomRow = {
  classRoomId: number;
  classCode: string;
  className: string;
};

export type ClassRoomOption = {
  classRoomId: number;
  className: string;
};

export type TeacherRow = {
  teacherId: number;
  displayName: string;
  isLiveActive: boolean;
  classRooms: TeacherClassRoomRow[];
};

export function toTeacherRow(dto: TeacherDTO): TeacherRow {
  return {
    teacherId: dto.teacher_id,
    displayName: dto.display_name,
    isLiveActive: dto.is_live_active,
    classRooms: dto.class_rooms.map((c) => ({
      classRoomId: c.class_room_id,
      classCode: c.class_code,
      className: c.class_name,
    })),
  };
}
