import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { TeacherApi, type TeacherListQuery } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";

export async function loadActiveTeacherList() {
  const page = await TeacherApi.getActiveTeachers();
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
  const [teacherPage, classRooms] = await Promise.all([
    TeacherApi.getActiveTeachers(),
    getClassRoomData(),
  ]);

  return {
    teachers: teacherPage.items.map(toTeacherRow),
    classRooms: classRooms.map((classRoom) => ({
      classRoomId: classRoom.classRoomId,
      className: classRoom.classRoomName,
    })),
    selectedTeacherId: teacherId,
  };
}

export function parseTeacherId(value: string | undefined) {
  const teacherId = Number(value);
  return Number.isInteger(teacherId) && teacherId > 0 ? teacherId : 0;
}
