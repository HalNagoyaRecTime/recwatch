import { teacherHttpApi } from "./http/teacher-http";
import type { TeacherDTO } from "./dto/teacher-dto";
import type {
  TeacherCreateRequest,
  TeacherBooleanFilter,
  TeacherListQuery,
  TeacherUpdateRequest,
} from "./contracts/teacher-api";

const TEACHER_FETCH_LIMIT = 100;

export const TeacherApi = {
  createTeacher: (body: TeacherCreateRequest) =>
    teacherHttpApi.createTeacher(body),
  getTeacherList: (query: TeacherListQuery = {}) =>
    teacherHttpApi.getTeacherList(query),
  getActiveTeachers: () => fetchAllTeachers("true"),
  getTeacherById: (teacherId: number) =>
    teacherHttpApi.getTeacherById(teacherId),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    teacherHttpApi.updateTeacher(teacherId, body),
};

async function fetchAllTeachers(isLiveActive: TeacherBooleanFilter) {
  const items: TeacherDTO[] = [];
  let offset = 0;
  let total = 0;

  while (true) {
    const result = await teacherHttpApi.getTeacherList({
      limit: TEACHER_FETCH_LIMIT,
      offset,
      isStaff: "all",
      isLiveActive,
      sortBy: "teacherId",
      sortOrder: "asc",
    });
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
}

export type { TeacherDTO, TeacherListPageDTO } from "./dto/teacher-dto";
export type {
  TeacherCreateRequest,
  TeacherBooleanFilter,
  TeacherListQuery,
  TeacherListSortBy,
  TeacherListSortOrder,
  TeacherUpdateRequest,
} from "./contracts/teacher-api";
