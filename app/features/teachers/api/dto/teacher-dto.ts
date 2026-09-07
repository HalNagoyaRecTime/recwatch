export type TeacherClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
};

export type TeacherDTO = {
  teacher_id: number;
  user_id: number;
  display_name: string;
  is_live_active: boolean;
  is_staff: boolean;
  class_rooms: TeacherClassRoomDTO[];
};

export type TeacherListPageDTO = {
  items: TeacherDTO[];
  total: number;
  limit: number;
  offset: number;
};
