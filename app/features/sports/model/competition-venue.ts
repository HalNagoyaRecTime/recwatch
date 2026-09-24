/** API が1件のイベントに登録できる実施場所の上限。 */
export const maxVenueSelection = 20;

export type CompetitionVenue = {
  id: number;
  name: string;
};

export function formatVenueNames(venues: readonly CompetitionVenue[]): string {
  return venues.map((venue) => venue.name).join("、");
}
