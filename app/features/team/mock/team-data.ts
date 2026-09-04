import type { Team } from "~/features/team/model/team";

export const mockTeams: readonly Team[] = [
  {
    id: 1,
    name: "青チーム",
    registeredClasses: ["IH12A-203"],
    registeredAt: "2026-09-01T09:00:00+09:00",
    updatedAt: "2026-09-04T18:30:00+09:00",
  },
  {
    id: 2,
    name: "赤チーム",
    registeredClasses: ["IH12A-204", "IH12A-205"],
    registeredAt: "2026-09-01T09:00:00+09:00",
    updatedAt: "2026-09-04T18:32:00+09:00",
  },
];
