import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { TeacherApi, type TeacherListQuery } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";

export async function loadActiveTeacherOptions() {
  const page = await TeacherApi.getActiveTeachers();
  return page.items.map((teacher) => {
    const row = toTeacherRow(teacher);
    return { displayName: row.displayName, teacherId: row.teacherId };
  });
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
  const [selectedTeacherDto, teacherPage, classRooms] = await Promise.all([
    teacherId > 0
      ? TeacherApi.getTeacherById(teacherId)
      : Promise.resolve(null),
    TeacherApi.getActiveTeachers(),
    getClassRoomData(),
  ]);

  const teachers = teacherPage.items.map(toTeacherRow);
  if (
    selectedTeacherDto &&
    !teachers.some((teacher) => teacher.teacherId === teacherId)
  ) {
    teachers.unshift(toTeacherRow(selectedTeacherDto));
  }

  return {
    teachers,
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
