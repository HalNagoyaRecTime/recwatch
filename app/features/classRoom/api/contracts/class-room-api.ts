import type {
  ClassRoom,
  ClassRoomPage,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";

export type ClassRoomListSortBy =
  | "classRoomId"
  | "classCode"
  | "className"
  | "teacherName"
  | "studentCount";

export type ClassRoomListSortOrder = "asc" | "desc";

export type ClassRoomListQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: ClassRoomListSortBy;
  sortOrder?: ClassRoomListSortOrder;
};

export interface ClassRoomManagementApi {
  getClassRoomList(query?: ClassRoomListQuery): Promise<ClassRoomPage>;
  getClassRoomById(classRoomId: number): Promise<ClassRoom>;
  createClassRoom(input: ClassRoomWriteInput): Promise<ClassRoom>;
  updateClassRoom(
    classRoomId: number,
    input: ClassRoomWriteInput
  ): Promise<ClassRoom>;
  deleteClassRoom(classRoomId: number): Promise<void>;
}

export type ClassRoomMutationApi = Pick<
  ClassRoomManagementApi,
  "createClassRoom" | "updateClassRoom" | "deleteClassRoom"
>;
