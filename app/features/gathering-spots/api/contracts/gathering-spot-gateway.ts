import type {
  GatheringSpot,
  GatheringSpotSort,
} from "~/features/gathering-spots/model/gathering-spot";

export type GatheringSpotListOptions = {
  limit?: number;
  offset?: number;
  name?: string;
  sort?: GatheringSpotSort;
};

export type GatheringSpotPage = {
  items: GatheringSpot[];
  total: number;
  limit: number;
  offset: number;
};

export interface GatheringSpotGateway {
  list(options?: GatheringSpotListOptions): Promise<GatheringSpotPage>;
  getById(id: number): Promise<GatheringSpot>;
  create(name: string): Promise<GatheringSpot>;
  update(id: number, name: string): Promise<GatheringSpot>;
  delete(id: number): Promise<void>;
}
