import type { classRoomData } from "~/features/classRoom/model/classRoom";
import { toClassRoomData } from "~/features/classRoom/model/classRoom";
import { ClassRoomApi } from "~/features/classRoom/api";

export async function getClassRoomData(): Promise<classRoomData[]> {
  const dtos = await ClassRoomApi.getClassRooms();
  if (!Array.isArray(dtos)) {
    throw new Error(`予期しない形式のレスポンス:${JSON.stringify(dtos)}`);
  }
  return dtos.map(toClassRoomData);
}
