import { apiClient } from "~/lib/api-client";
import type {
  ClassRoomListQuery,
  ClassRoomManagementApi,
} from "~/features/classRoom/api/contracts/class-room-api";
import type {
  ClassRoomDTO,
  ClassRoomListResponseDTO,
} from "~/features/classRoom/api/dto/class-room-dto";
import {
  toClassRoom,
  toClassRoomPage,
  toClassRoomWriteDTO,
} from "~/features/classRoom/api/mappers/class-room-mappers";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";

export type ClassRoomHttpClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
};

export function createClassRoomHttpApi(
  client: ClassRoomHttpClient = apiClient
): ClassRoomManagementApi {
  return {
    async getClassRoomList(query: ClassRoomListQuery = {}) {
      const params = new URLSearchParams({
        limit: String(query.limit ?? 50),
        offset: String(query.offset ?? 0),
      });
      const search = query.search?.trim();
      if (search) params.set("search", search);
      params.set("sortBy", query.sortBy ?? "classRoomId");
      params.set("sortOrder", query.sortOrder ?? "asc");

      const response = await client.get<ClassRoomListResponseDTO>(
        `/api/v1/classrooms?${params.toString()}`
      );
      return toClassRoomPage(response);
    },

    async getClassRoomById(classRoomId: number) {
      const response = await client.get<ClassRoomDTO>(
        `/api/v1/classrooms/${classRoomId}`
      );
      return toClassRoom(response);
    },

    async createClassRoom(input: ClassRoomWriteInput) {
      const response = await client.post<ClassRoomDTO>(
        "/api/v1/classrooms",
        toClassRoomWriteDTO(input)
      );
      return toClassRoom(response);
    },

    async updateClassRoom(classRoomId: number, input: ClassRoomWriteInput) {
      const response = await client.put<ClassRoomDTO>(
        `/api/v1/classrooms/${classRoomId}`,
        toClassRoomWriteDTO(input)
      );
      return toClassRoom(response);
    },

    deleteClassRoom(classRoomId: number) {
      return client.delete(`/api/v1/classrooms/${classRoomId}`);
    },
  };
}

export const classRoomHttpApi = createClassRoomHttpApi();
