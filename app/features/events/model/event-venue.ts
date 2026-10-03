/** API が1件のイベントに登録できる実施場所の上限。 */
export const maxVenueSelection = 20;

export type EventVenue = {
  id: number;
  name: string;
};

export function formatVenueNames(venues: readonly EventVenue[]): string {
  return venues.map((venue) => venue.name).join("、");
}
