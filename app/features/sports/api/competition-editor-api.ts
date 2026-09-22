import type {
  CompetitionFormValue,
  CompetitionWriteInput,
} from "~/features/sports/model/competition-form";
import type { CompetitionVenue } from "~/features/sports/model/competition-venue";

export type CompetitionEditorApi = {
  create(input: CompetitionWriteInput): Promise<{ id: number }>;
  get(eventId: number): Promise<CompetitionFormValue>;
  listVenues(): Promise<CompetitionVenue[]>;
  update(eventId: number, input: CompetitionWriteInput): Promise<void>;
};
