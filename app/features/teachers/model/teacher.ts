export type TeacherClassRoomRow = {
  classRoomId: number;
  classCode: string;
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
  isStaff: boolean;
  classRooms: TeacherClassRoomRow[];
};
