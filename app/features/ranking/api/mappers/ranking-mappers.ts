import type { Ranking } from "../../model/ranking";
import type { RankingEntryDTO } from "../dto/ranking-dto";

export function toRanking(dto: RankingEntryDTO): Ranking {
  return {
    rank: dto.rank,
    teamId: dto.team_id,
    teamName: dto.team_name,
    score: dto.scores,
  };
}
