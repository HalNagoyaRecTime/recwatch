import type { Team } from "~/features/team/model/team";
import { mockTeams } from "~/features/team/mock/team-data";

export type TeamInput = {
  name: string;
  registeredClasses: readonly string[];
};

let teams = mockTeams.map((team) => ({ ...team }));

export function getTeams(): Team[] {
  return teams.map((team) => ({ ...team }));
}

export function getTeam(teamId: number): Team | null {
  const team = teams.find((item) => item.id === teamId);
  return team ? { ...team } : null;
}

export function createTeam(input: TeamInput): Team {
  const nextId = Math.max(0, ...teams.map((team) => team.id)) + 1;
  const team = {
    id: nextId,
    name: input.name,
    registeredClasses: [...input.registeredClasses],
    registeredAt: "2026-09-05T09:00:00+09:00",
    updatedAt: "2026-09-05T12:00:00+09:00",
  } satisfies Team;
  teams = [...teams, team];
  return { ...team };
}

export function updateTeam(teamId: number, input: TeamInput): Team | null {
  const team = teams.find((item) => item.id === teamId);
  if (!team) return null;

  const updatedTeam = {
    ...team,
    name: input.name,
    registeredClasses: [...input.registeredClasses],
    updatedAt: "2026-09-05T12:00:00+09:00",
  };
  teams = teams.map((item) => (item.id === teamId ? updatedTeam : item));
  return { ...updatedTeam };
}
