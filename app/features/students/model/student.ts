export type StudentClassRoomRow = {
  classRoomId: number;
  classCode: string;
  className: string;
};

export type StudentRow = {
  studentId: number;
  userId: number;
  displayName: string;
  studentIdNumber: string;
  attendanceNumber: number;
  isLiveActive: boolean;
  isStaff: boolean;
  classRoom: StudentClassRoomRow;
};

export type StudentPage = {
  items: StudentRow[];
  total: number;
  limit: number;
  offset: number;
};

export type StudentWriteInput = {
  attendanceNumber: number;
  classRoomId: number;
  displayName: string;
  studentIdNumber: string;
};
