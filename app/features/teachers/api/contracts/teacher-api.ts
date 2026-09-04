export type TeacherCreateRequest = {
  userName: string;
  classRoomIds: number[];
};

export type TeacherListSortBy =
  | "teacherId"
  | "displayName"
  | "classCode"
  | "className";
export type TeacherListSortOrder = "asc" | "desc";
export type TeacherBooleanFilter = "true" | "false" | "all";

export type TeacherListQuery = {
  limit: number;
  offset: number;
  search?: string;
  classRoomId?: number;
  isStaff?: TeacherBooleanFilter;
  isLiveActive?: TeacherBooleanFilter;
  sortBy?: TeacherListSortBy;
  sortOrder?: TeacherListSortOrder;
};

export type TeacherUpdateRequest = {
  userName: string;
  classRoomIds: number[];
};

export type TeacherAssignmentUpdateRequest = TeacherUpdateRequest;
