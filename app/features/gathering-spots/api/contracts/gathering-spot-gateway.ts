import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

export type GatheringSpotListOptions = {
  limit?: number;
  offset?: number;
  name?: string;
  sortBy?: GatheringSpotSortBy;
  sortOrder?: GatheringSpotSortOrder;
};

export type GatheringSpotSortBy = "id" | "name" | "createdAt" | "updatedAt";
export type GatheringSpotSortOrder = "asc" | "desc";

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
