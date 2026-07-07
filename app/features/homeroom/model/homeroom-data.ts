import type { HomeroomData } from "~/features/homeroom/model/homeroom";
import { toHomeroomData } from "~/features/homeroom/model/homeroom";
import { homeroomApi } from "~/features/homeroom/api";

export async function getHomeroomData(): Promise<HomeroomData[]> {
  const dtos = await homeroomApi.getHomerooms();
  if (!Array.isArray(dtos)) {
    throw new Error(`予期しない形式のレスポンス:${JSON.stringify(dtos)}`);
  }
  return dtos.map(toHomeroomData);
}
