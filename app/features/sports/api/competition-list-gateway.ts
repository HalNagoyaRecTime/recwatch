import type { CompetitionListItem } from "~/features/sports/model/competition-list-item";

export type CompetitionListGateway = {
  delete(eventId: number): Promise<void>;
  load(): Promise<CompetitionListItem[]>;
};
