import { classRoomHttpApi, teacherHttpApi } from "./http/teacher-http";
import type {
  ClassRoomDTO,
  ClassRoomPageDTO,
  TeacherDTO,
  TeacherPageDTO,
} from "./dto/teacher-dto";
import type { TeacherUpdateRequest } from "./contracts/teacher-api";

export const TeacherApi = {
  async getTeachers(): Promise<TeacherPageDTO> {
    const items: TeacherDTO[] = [];
    let page = 1;
    let total = 0;

    while (true) {
      const result = await teacherHttpApi.getTeachersPage(page);
      items.push(...result.items);
      total = result.total;

      if (result.items.length === 0 || page >= result.total_pages) break;
      page += 1;
    }

    return { items, total, page: 1, limit: items.length, total_pages: 1 };
  },
  getTeacherById: (teacherId: number) =>
    teacherHttpApi.getTeacherById(teacherId),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    teacherHttpApi.updateTeacher(teacherId, body),
};

export const ClassRoomApi = {
  async getClassRooms(): Promise<ClassRoomPageDTO> {
    const classrooms: ClassRoomDTO[] = [];
    let offset = 0;
    let total = 0;

    while (true) {
      const result = await classRoomHttpApi.getClassRoomsPage(offset);
      classrooms.push(...result.classrooms);
      total = result.total;
      offset += result.classrooms.length;

      if (result.classrooms.length === 0 || offset >= total) break;
    }

    return { classrooms, total, limit: classrooms.length, offset: 0 };
  },
};

export type {
  ClassRoomDTO,
  ClassRoomPageDTO,
  TeacherDTO,
  TeacherPageDTO,
} from "./dto/teacher-dto";
export type { TeacherUpdateRequest } from "./contracts/teacher-api";
