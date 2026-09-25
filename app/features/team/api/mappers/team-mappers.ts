import type { Team } from "../../model/team";
import type { TeamDTO } from "../dto/team-dto";

export function toTeam(dto: TeamDTO): Team {
  return {
    id: dto.team_id,
    name: dto.team_name,
    registeredClasses: dto.registered_classes,
    scores: dto.scores,
    registeredAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
