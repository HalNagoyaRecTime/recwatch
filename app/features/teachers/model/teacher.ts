export type TeacherClassRoomRow = {
  classRoomId: number;
  className: string;
};

export type TeacherRow = {
  teacherId: number;
  teacherCode: string;
  displayName: string;
  isLiveActive: boolean;
  classRooms: TeacherClassRoomRow[];
};
