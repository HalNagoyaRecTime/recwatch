export type CompetitionVenue = {
  id: number;
  name: string;
};

export function formatVenueNames(venues: readonly CompetitionVenue[]): string {
  return venues.map((venue) => venue.name).join("、");
}
