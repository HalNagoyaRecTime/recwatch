import type {
  CompetitionFormValue,
  CompetitionWriteInput,
} from "~/features/sports/model/competition-form";

export type CompetitionEditorApi = {
  create(input: CompetitionWriteInput): Promise<{ id: number }>;
  get(eventId: number): Promise<CompetitionFormValue>;
  update(eventId: number, input: CompetitionWriteInput): Promise<void>;
};
