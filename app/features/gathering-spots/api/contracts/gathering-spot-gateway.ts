import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

export interface GatheringSpotGateway {
  list(): Promise<GatheringSpot[]>;
  create(name: string): Promise<GatheringSpot>;
  update(id: number, name: string): Promise<GatheringSpot>;
}
