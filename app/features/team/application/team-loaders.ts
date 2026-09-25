import { TeamApi, type TeamListQuery } from "~/features/team/api";

export async function loadTeamListPage(query: TeamListQuery) {
  const page = await TeamApi.getTeamList(query);
  return {
    limit: page.limit,
    offset: page.offset,
    teams: page.items,
    total: page.total,
  };
}
