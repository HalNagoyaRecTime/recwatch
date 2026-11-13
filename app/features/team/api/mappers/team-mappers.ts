import { toUtcIsoDateTime } from "~/lib/api-date-time";

import type { Team } from "../../model/team";
import type { TeamDTO } from "../dto/team-dto";

export function toTeam(dto: TeamDTO): Team {
  return {
    id: dto.team_id,
    name: dto.team_name,
    registeredClasses: dto.registered_classes,
    score: dto.scores,
    registeredAt: toUtcIsoDateTime(dto.created_at),
    updatedAt: toUtcIsoDateTime(dto.updated_at),
  };
}
