import { teamHttpApi } from "./http/team-http";
import { toTeam } from "./mappers/team-mappers";
import type {
  TeamListQuery,
  TeamScoreAddRequest,
  TeamWriteRequest,
} from "./contracts/team-api";
import type { Team } from "../model/team";

export type TeamListPage = {
  items: Team[];
  total: number;
  limit: number;
  offset: number;
};

export const TeamApi = {
  async getTeamList(query: TeamListQuery): Promise<TeamListPage> {
    const result = await teamHttpApi.getTeamList(query);
    return {
      items: result.items.map(toTeam),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  },
  async getTeamById(teamId: number): Promise<Team> {
    return toTeam(await teamHttpApi.getTeamById(teamId));
  },
  async createTeam(body: TeamWriteRequest): Promise<Team> {
    return toTeam(await teamHttpApi.createTeam(body));
  },
  async updateTeam(teamId: number, body: TeamWriteRequest): Promise<Team> {
    return toTeam(await teamHttpApi.updateTeam(teamId, body));
  },
  deleteTeam: (teamId: number) => teamHttpApi.deleteTeam(teamId),
  async addTeamScore(teamId: number, body: TeamScoreAddRequest): Promise<Team> {
    return toTeam(await teamHttpApi.addTeamScore(teamId, body));
  },
};

export type { TeamDTO, TeamListPageDTO } from "./dto/team-dto";
export type {
  TeamListQuery,
  TeamListSortBy,
  TeamListSortOrder,
  TeamScoreAddRequest,
  TeamWriteRequest,
} from "./contracts/team-api";
