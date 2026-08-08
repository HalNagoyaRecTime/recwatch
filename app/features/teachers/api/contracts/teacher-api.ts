export type TeacherApiSortBy = "teacherId" | "displayName";
export type TeacherApiSortOrder = "asc" | "desc";

export type TeacherListQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: TeacherApiSortBy;
  sortOrder?: TeacherApiSortOrder;
};

export type TeacherUpdateRequest = {
  userName: string;
  classRoomIds: number[];
};

export type TeacherCreateRequest = {
  userName: string;
  classRoomIds: number[];
};
