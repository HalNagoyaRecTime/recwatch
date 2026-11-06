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
  lockVersion: number;
};

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
  /** 更新時に、取得した版を送り返して競合を検出する。作成では送らない。 */
  lockVersion?: number;
};
