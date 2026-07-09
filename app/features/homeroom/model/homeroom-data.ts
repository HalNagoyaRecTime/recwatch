import type { HomeRoomData } from "~/features/homeroom/model/homeroom";
import { toHomeRoomData } from "~/features/homeroom/model/homeroom";
import { homeroomApi } from "~/features/homeroom/api";

export async function getHomeRoomData(): Promise<HomeRoomData[]> {
  const dtos = await homeroomApi.getHomerooms();
  if (!Array.isArray(dtos)) {
    throw new Error(`予期しない形式のレスポンス:${JSON.stringify(dtos)}`);
  }
  return dtos.map(toHomeRoomData);
}
