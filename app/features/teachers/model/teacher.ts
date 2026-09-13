export type TeacherClassRoomRow = {
  classRoomId: number;
  classCode: string;
  className: string;
};

export type ClassRoomOption = {
  classRoomId: number;
  classCode?: string;
  className: string;
};

export type TeacherRow = {
  teacherId: number;
  userId: number;
  displayName: string;
  email: string;
  isLiveActive: boolean;
  isStaff: boolean;
  classRooms: TeacherClassRoomRow[];
};
