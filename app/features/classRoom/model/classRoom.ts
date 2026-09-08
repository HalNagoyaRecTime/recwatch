export type ClassRoomTeacher = {
  teacherId: number;
  userId: number;
  displayName: string;
};

export type ClassRoom = {
  classRoomId: number;
  classCode: string;
  className: string;
  studentCount: number;
  teacher: ClassRoomTeacher | null;
};

export type ClassRoomData = ClassRoom;

export type ClassRoomPage = {
  items: ClassRoom[];
  total: number;
  limit: number;
  offset: number;
};

export type ClassRoomWriteInput = {
  classCode: string;
  className: string;
  teacherId: number | null;
};
