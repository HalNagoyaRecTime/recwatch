import {
  ClassRoomApi,
  TeacherApi,
  type TeacherListQuery,
} from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";

export async function loadTeacherList() {
  const page = await TeacherApi.getTeachers();
  return { teachers: page.items.map(toTeacherRow) };
}

export async function loadTeacherListPage(query: TeacherListQuery) {
  const page = await TeacherApi.getTeacherList(query);
  return {
    limit: page.limit,
    offset: page.offset,
    teachers: page.items.map(toTeacherRow),
    total: page.total,
  };
}

export async function loadTeacherAssignment(teacherId: number) {
  const [teacherPage, classRoomPage] = await Promise.all([
    TeacherApi.getTeachers(),
    ClassRoomApi.getClassRooms(),
  ]);

  return {
    teachers: teacherPage.items.map(toTeacherRow),
    classRooms: classRoomPage.classrooms.map((classRoom) => ({
      classRoomId: classRoom.class_room_id,
      className: classRoom.class_name,
    })),
    selectedTeacherId: teacherId,
  };
}

export function parseTeacherId(value: string | undefined) {
  const teacherId = Number(value);
  return Number.isInteger(teacherId) && teacherId > 0 ? teacherId : 0;
}
