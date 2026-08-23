import type {
  CompetitionAssignmentData,
  SaveCompetitionAssignmentInput,
  SaveCompetitionAssignmentResult,
} from "../model/competition-assignment";

export type CompetitionAssignmentGateway = {
  load(): Promise<CompetitionAssignmentData>;
  loadMemberUserIds(gatheringId: number): Promise<number[]>;
  save(
    input: SaveCompetitionAssignmentInput
  ): Promise<SaveCompetitionAssignmentResult>;
};
