import type {
  ClassRoomListQuery,
  ClassRoomManagementApi,
} from "~/features/classRoom/api/contracts/class-room-api";

export async function loadClassRoomListPage(
  api: ClassRoomManagementApi,
  query: ClassRoomListQuery
) {
  return api.getClassRoomList(query);
}
