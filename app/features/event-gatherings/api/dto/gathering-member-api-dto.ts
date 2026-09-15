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
