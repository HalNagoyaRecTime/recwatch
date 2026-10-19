import type { ClassRoomDTO } from "~/features/classRoom/api";

export type ClassRoomData = {
  classRoomId: number;
  classRoomCode: string;
  classRoomName: string;
  studentCount: number;
  teacherId: number | null;
  teacherName: string | null;
};

export function toClassRoomData(dto: ClassRoomDTO): ClassRoomData {
  return {
    classRoomId: dto.class_room_id,
    classRoomCode: dto.class_code,
    classRoomName: dto.class_name,
    studentCount: dto.student_count,
    teacherId: dto.teacher?.teacher_id ?? null,
    teacherName: dto.teacher?.display_name ?? null,
  };
}
