export type TeacherClassRoomRow = {
  classRoomId: number;
  className: string;
};

export type ClassRoomOption = {
  classRoomId: number;
  className: string;
};

export type TeacherRow = {
  teacherId: number;
  displayName: string;
  isLiveActive: boolean;
  classRooms: TeacherClassRoomRow[];
};
