import type { classRoomDTO } from "~/features/classRoom/api";

export type classRoomData = {
  ClassRoomId: number;
  ClassRoomCode: string;
  ClassRoomName: string;
};

export function toClassRoomData(dto: classRoomDTO): classRoomData {
  return {
    ClassRoomId: dto.class_room_id,
    ClassRoomCode: dto.class_code,
    ClassRoomName: dto.class_name,
  };
}
