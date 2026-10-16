import { apiClient } from "~/lib/api-client";
import type {
  TeamListQuery,
  TeamScoreAddRequest,
  TeamWriteRequest,
} from "../contracts/team-api";
import type { TeamDTO, TeamListPageDTO } from "../dto/team-dto";

function toTeamWriteBody(body: TeamWriteRequest) {
  return { team_name: body.teamName, class_codes: body.classCodes };
}

export const teamHttpApi = {
  getTeamList: (query: TeamListQuery) => {
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.search) params.set("search", query.search);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);
    return apiClient.get<TeamListPageDTO>(`/api/v1/teams?${params.toString()}`);
  },
  getTeamById: (teamId: number) =>
    apiClient.get<TeamDTO>(`/api/v1/teams/${teamId}`),
  createTeam: (body: TeamWriteRequest) =>
    apiClient.post<TeamDTO>("/api/v1/teams", toTeamWriteBody(body)),
  updateTeam: (teamId: number, body: TeamWriteRequest) =>
    apiClient.put<TeamDTO>(`/api/v1/teams/${teamId}`, toTeamWriteBody(body)),
  deleteTeam: (teamId: number) => apiClient.delete(`/api/v1/teams/${teamId}`),
  addTeamScore: (teamId: number, body: TeamScoreAddRequest) =>
    apiClient.patch<TeamDTO>(`/api/v1/teams/${teamId}/score`, {
      points: body.points,
    }),
};
