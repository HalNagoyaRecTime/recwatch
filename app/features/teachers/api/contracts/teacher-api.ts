export type TeacherCreateRequest = {
  userName: string;
  classRoomIds: number[];
};

export type TeacherListSortBy = "teacherId" | "displayName";
export type TeacherListSortOrder = "asc" | "desc";

export type TeacherListQuery = {
  limit: number;
  offset: number;
  search?: string;
  sortBy?: TeacherListSortBy;
  sortOrder?: TeacherListSortOrder;
};

export type TeacherUpdateRequest = {
  userName: string;
  isLiveActive: boolean;
  classRoomIds: number[];
};
