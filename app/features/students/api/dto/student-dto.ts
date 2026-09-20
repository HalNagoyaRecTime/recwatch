export type StudentClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
};

/** Student管理APIが返すsnake_caseのレスポンスDTOです。 */
export type StudentDTO = {
  student_id: number;
  user_id: number;
  display_name: string;
  student_id_number: string;
  attendance_number: number;
  is_live_active: boolean;
  is_staff: boolean;
  class_room: StudentClassRoomDTO;
};

export type StudentManagementDTO = StudentDTO;

export type StudentPageDTO = {
  items: StudentDTO[];
  total: number;
  limit: number;
  offset: number;
};

export type StudentWriteDTO = {
  attendance_number: number;
  class_room_id: number;
  display_name: string;
  student_id_number: string;
};
