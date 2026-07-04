import type { HomeRoomData } from "~/features/homeroom/model/homeroom";
import { toHomeRoomData } from "~/features/homeroom/model/homeroom";
import { homeroomApi } from "~/features/homeroom/api";

export async function getHomeRoomData(): Promise<HomeRoomData[]> {
  const dtos = await homeroomApi.getHomerooms();
  return dtos.map(toHomeRoomData);
}
