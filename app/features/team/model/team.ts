export type Team = {
  id: number;
  name: string;
  registeredClasses: readonly string[];
  score: number;
  registeredAt: string;
  updatedAt: string;
};

/** APIは得点が0のチームだけを削除でき、それ以外は409(TEAM_HAS_SCORES)を返す。 */
export function canDeleteTeam(team: Pick<Team, "score">): boolean {
  return team.score === 0;
}
