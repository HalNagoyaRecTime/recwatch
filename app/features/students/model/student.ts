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
  lockVersion: number;
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
  /** 更新時に、取得した版を送り返して競合を検出する。作成では送らない。 */
  lockVersion?: number;
};

export type StudentClassRoomAssignmentInput = {
  attendanceNumber: number | null;
  classRoomId: number | null;
};
