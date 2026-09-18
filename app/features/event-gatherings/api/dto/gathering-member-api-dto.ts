/** GET /api/v1/classrooms のページ応答。参加者ピッカーで使う項目だけを持つ。 */
export type ClassroomResponseDto = {
  class_room_id: number;
  class_name: string;
};

export type ClassroomPageResponseDto = {
  items: ClassroomResponseDto[];
  total: number;
};

/** GET /api/v1/students のページ応答。参加者ピッカーで使う項目だけを持つ。 */
export type StudentResponseDto = {
  student_id: number;
  user_id: number;
  display_name: string;
  attendance_number: number;
  student_id_number: string;
  class_room: {
    class_room_id: number;
    class_name: string;
  };
};

export type StudentPageResponseDto = {
  items: StudentResponseDto[];
  total: number;
};

/**
 * GET / PUT /api/v1/gatherings/:gatheringId/members の 1 件。
 * どちらも配列で返し、参加者の user_id だけを使う。
 */
export type GatheringMemberResponseDto = {
  gathering_group_member_id: number;
  gathering_id: number;
  user_id: number;
};

/** PUT /api/v1/gatherings/:gatheringId/members のリクエスト。集合の参加者の最終状態を送る。 */
export type ReplaceGatheringMembersRequestDto = {
  user_ids: number[];
};
