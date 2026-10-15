import type {
  TeacherPage,
  TeacherRow,
} from "~/features/teachers/model/teacher";

export type TeacherCreateRequest = {
  email: string;
  userName: string;
  classRoomIds: number[];
};

export type TeacherListSortBy =
  | "teacherId"
  | "displayName"
  | "isStaff"
  | "isLiveActive"
  | "classCode"
  | "className";
export type TeacherListSortOrder = "asc" | "desc";
export type TeacherBooleanFilter = "true" | "false" | "all";

export type TeacherListQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  classRoomId?: number;
  isStaff?: TeacherBooleanFilter;
  isLiveActive?: TeacherBooleanFilter;
  sortBy?: TeacherListSortBy;
  sortOrder?: TeacherListSortOrder;
};

export type TeacherUpdateRequest = {
  email: string;
  userName: string;
  classRoomIds: number[];
};

export type UserStatusUpdateInput = {
  isLiveActive: boolean;
};

export interface TeacherQueryApi {
  getTeacherList(query?: TeacherListQuery): Promise<TeacherPage>;
  getTeacherById(teacherId: number): Promise<TeacherRow>;
  getActiveTeachers(): Promise<TeacherPage>;
}

export interface TeacherMutationApi {
  createTeacher(input: TeacherCreateRequest): Promise<TeacherRow>;
  updateTeacher(
    teacherId: number,
    input: TeacherUpdateRequest
  ): Promise<TeacherRow>;
  updateUserStatus(userId: number, input: UserStatusUpdateInput): Promise<void>;
  assignStaff(userId: number): Promise<void>;
  revokeStaff(userId: number): Promise<void>;
}

export interface TeacherManagementApi
  extends TeacherQueryApi, TeacherMutationApi {}
