import type { HomeroomDTO } from "~/features/homeroom/api";

export type HomeroomData = {
  HomeroomId: number;
  HomeroomCode: string;
  HomeroomName: string;
};

export function toHomeroomData(dto: HomeroomDTO): HomeroomData {
  return {
    HomeroomId: dto.class_room_id,
    HomeroomCode: dto.class_code,
    HomeroomName: dto.name,
  };
}
