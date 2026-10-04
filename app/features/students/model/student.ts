export type StudentClassRoomRow = {
  classRoomId: number;
  classCode: string;
  className: string;
};

export type StudentClassRoomOption = StudentClassRoomRow;

export type StudentRow = {
  studentId: number;
  userId: number;
  displayName: string;
  studentIdNumber: string;
  attendanceNumber: number | null;
  isLiveActive: boolean;
  isStaff: boolean;
  classRoom: StudentClassRoomRow | null;
};

export type StudentPage = {
  items: StudentRow[];
  total: number;
  limit: number;
  offset: number;
};

export type StudentWriteInput = {
  attendanceNumber: number | null;
  classRoomId: number | null;
  displayName: string;
  studentIdNumber: string;
};
