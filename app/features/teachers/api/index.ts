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
    let offset = 0;
    let total = 0;

    while (true) {
      const result = await teacherHttpApi.getTeachersPage(offset);
      items.push(...result.items);
      total = result.total;

      if (
        result.items.length === 0 ||
        items.length >= total ||
        result.items.length < result.limit
      ) {
        break;
      }
      offset += result.items.length;
    }

    return { items, total, limit: items.length, offset: 0 };
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
