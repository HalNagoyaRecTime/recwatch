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
  /** 利用中かどうか。停止中の学生は新しく参加者に加えられない。 */
  isLiveActive: boolean;
};

/** 選択候補には出さず、登録済みの参加者の氏名を引くためだけに使う学生以外の利用者。 */
export type MemberNonStudent = {
  userId: number;
  name: string;
  isLiveActive: boolean;
};

export type GatheringMemberCandidates = {
  classrooms: MemberClassroom[];
  students: MemberStudent[];
  /**
   * 学生以外の利用者を user_id から引く表。参加者は学生に限られないため、
   * 候補一覧に行が無い登録済みの参加者を名前付きで表示するのに使う。
   */
  nonStudents: ReadonlyMap<number, MemberNonStudent>;
};
