import type { classRoomData } from "~/features/classRoom/model/classRoom";
import { toClassRoomData } from "~/features/classRoom/model/classRoom";
import { ClassRoomApi } from "~/features/classRoom/api";

export async function getClassRoomData(): Promise<classRoomData[]> {
  const page = await ClassRoomApi.getClassRooms();
  return page.classrooms.map(toClassRoomData);
}
