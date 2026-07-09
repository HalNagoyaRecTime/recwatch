import type { HomeroomDTO } from "~/features/homeroom/api";

export type HomeRoomData = {
  HomeRoomId: number;
  HomeRoomCode: string;
  HomeRoomName: string;
};

export function toHomeRoomData(dto: HomeroomDTO): HomeRoomData {
  return {
    HomeRoomId: dto.class_room_id,
    HomeRoomCode: dto.class_code,
    HomeRoomName: dto.name,
  };
}
