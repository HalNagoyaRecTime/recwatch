/** ClassRoom APIが返すsnake_caseのレスポンスDTOです。 */
export type ClassRoomTeacherDTO = {
  teacher_id: number;
  user_id: number;
  display_name: string;
};

export type ClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
  student_count: number;
  teacher: ClassRoomTeacherDTO | null;
};

export type ClassRoomPageDTO = {
  items: ClassRoomDTO[];
  total: number;
  limit: number;
  offset: number;
};

export type ClassRoomWriteDTO = {
  classCode: string;
  className: string;
  teacherId: number | null;
};
