import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoomListQuery } from "~/features/classRoom/api";

export async function loadClassRoomListPage(query: ClassRoomListQuery) {
  return ClassRoomApi.getClassRoomList(query);
}
