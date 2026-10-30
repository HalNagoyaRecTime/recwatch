import type { Venue, VenueSort } from "~/features/venues/model/venue";

export type VenueListOptions = {
  limit?: number;
  offset?: number;
  name?: string;
  sort?: VenueSort;
};

export type VenuePage = {
  items: Venue[];
  total: number;
  limit: number;
  offset: number;
};

export interface VenueGateway {
  list(options?: VenueListOptions): Promise<VenuePage>;
  create(name: string): Promise<Venue>;
  update(id: number, name: string): Promise<Venue>;
  delete(id: number): Promise<void>;
  setImage(id: number, image: Blob): Promise<void>;
  deleteImage(id: number): Promise<void>;
}
