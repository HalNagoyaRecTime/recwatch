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
  class_rooms: TeacherClassRoomDTO[];
};

export type TeacherPageDTO = {
  items: TeacherDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type ClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
  student_count: number;
  teacher: { teacher_id: number; display_name: string } | null;
};

export type ClassRoomPageDTO = {
  classrooms: ClassRoomDTO[];
  total: number;
  limit: number;
  offset: number;
};
