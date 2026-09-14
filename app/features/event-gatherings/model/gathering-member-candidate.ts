/** 参加者ピッカーで選択候補になる学生とクラス。 */
export type MemberClassroom = {
  id: number;
  name: string;
};

export type MemberStudent = {
  id: number;
  userId: number;
  name: string;
  classroomId: number;
  attendanceNumber: number;
  studentNumber: string;
};

export type GatheringMemberCandidates = {
  classrooms: MemberClassroom[];
  students: MemberStudent[];
};
