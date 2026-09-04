import { ClassRoomApi } from "~/features/classRoom/api";
import { StudentApi, type StudentListQuery } from "~/features/members/api";

export async function loadStudentListPage(query: StudentListQuery) {
  const page = await StudentApi.getStudents(query);
  return {
    limit: page.limit,
    offset: page.offset,
    students: page.items,
    total: page.total,
  };
}

export async function loadStudentClassRooms() {
  const page = await ClassRoomApi.getClassRooms();
  return page.classrooms.map((classRoom) => ({
    classRoomId: classRoom.class_room_id,
    classRoomCode: classRoom.class_code,
    classRoomName: classRoom.class_name,
    studentCount: classRoom.student_count,
    teacherId: classRoom.teacher?.teacher_id ?? null,
    teacherName: classRoom.teacher?.display_name ?? null,
  }));
}
