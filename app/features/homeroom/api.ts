import { apiClient } from "~/lib/api-client";

export type HomeroomDTO = {
  class_room_id: number;
  class_code: string;
  name: string;
};

export const homeroomApi = {
  getHomerooms: () => apiClient.get<HomeroomDTO[]>("/api/v1/classes"),
};
