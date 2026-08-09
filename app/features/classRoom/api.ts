import { apiClient } from "~/lib/api-client";

export type classRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
  student_count: number;
};

export type classRoomPageDTO = {
  classrooms: classRoomDTO[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_LIMIT = 100;

export const ClassRoomApi = {
  async getAllClassRooms(): Promise<classRoomDTO[]> {
    const classrooms: classRoomDTO[] = [];
    let offset = 0;

    while (true) {
      const page = await apiClient.get<classRoomPageDTO>(
        `/api/v1/classrooms?limit=${PAGE_LIMIT}&offset=${offset}`
      );
      classrooms.push(...page.classrooms);
      offset += page.classrooms.length;

      if (page.classrooms.length === 0 || offset >= page.total) break;
    }

    return classrooms;
  },
};
