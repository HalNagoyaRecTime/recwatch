export type TeacherCreateRequest = {
  userName: string;
  classRoomIds: number[];
};

export type TeacherUpdateRequest = {
  userName: string;
  isLiveActive: boolean;
  classRoomIds: number[];
};
