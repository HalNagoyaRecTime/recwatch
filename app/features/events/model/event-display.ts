import type { VenueOption } from "~/features/venues/public";

export function formatVenueNames(venues: readonly VenueOption[]): string {
  return venues.map((venue) => venue.name).join("、");
}
