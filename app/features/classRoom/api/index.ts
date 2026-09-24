import { classRoomHttpApi } from "~/features/classRoom/api/http/class-room-http";

export const ClassRoomApi = classRoomHttpApi;

export type {
  ClassRoomListQuery,
  ClassRoomListSortBy,
  ClassRoomListSortOrder,
  ClassRoomManagementApi,
  ClassRoomMutationApi,
} from "~/features/classRoom/api/contracts/class-room-api";
export type {
  ClassRoom,
  ClassRoomPage,
  ClassRoomTeacher,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";
