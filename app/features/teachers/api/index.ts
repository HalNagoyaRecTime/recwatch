import { teacherHttpApi } from "./http/teacher-http";
import type { TeacherDTO, TeacherListPageDTO } from "./dto/teacher-dto";
import { toTeacherPage, toTeacherRow } from "./mappers/teacher-mappers";
import type {
  TeacherCreateRequest,
  TeacherBooleanFilter,
  TeacherListQuery,
  TeacherManagementApi,
  TeacherUpdateRequest,
  UserStatusUpdateInput,
} from "./contracts/teacher-api";
import type {
  TeacherPage,
  TeacherRow,
} from "~/features/teachers/model/teacher";

const TEACHER_FETCH_LIMIT = 100;

export const TeacherApi: TeacherManagementApi = {
  async createTeacher(input: TeacherCreateRequest): Promise<TeacherRow> {
    return toTeacherRow(await teacherHttpApi.createTeacher(input));
  },
  async getTeacherList(query: TeacherListQuery = {}): Promise<TeacherPage> {
    return toTeacherPage(await teacherHttpApi.getTeacherList(query));
  },
  async getActiveTeachers(): Promise<TeacherPage> {
    return toTeacherPage(await fetchAllTeachers("true"));
  },
  async getTeacherById(teacherId: number): Promise<TeacherRow> {
    return toTeacherRow(await teacherHttpApi.getTeacherById(teacherId));
  },
  async updateTeacher(
    teacherId: number,
    input: TeacherUpdateRequest
  ): Promise<TeacherRow> {
    return toTeacherRow(await teacherHttpApi.updateTeacher(teacherId, input));
  },
  updateUserStatus: (userId: number, input: UserStatusUpdateInput) =>
    teacherHttpApi.updateUserStatus(userId, input),
  assignStaff: (userId: number) => teacherHttpApi.assignStaff(userId),
  revokeStaff: (userId: number) => teacherHttpApi.revokeStaff(userId),
};

async function fetchAllTeachers(
  isLiveActive: TeacherBooleanFilter
): Promise<TeacherListPageDTO> {
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

export type {
  TeacherCreateRequest,
  TeacherBooleanFilter,
  TeacherListQuery,
  TeacherListSortBy,
  TeacherListSortOrder,
  TeacherManagementApi,
  TeacherMutationApi,
  TeacherQueryApi,
  TeacherUpdateRequest,
  UserStatusUpdateInput,
} from "./contracts/teacher-api";
export type {
  TeacherPage,
  TeacherRow,
} from "~/features/teachers/model/teacher";
