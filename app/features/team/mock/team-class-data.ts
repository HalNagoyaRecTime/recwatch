export type TeamClassOption = {
  code: string;
  id: number;
  name: string;
};

export const mockTeamClasses: readonly TeamClassOption[] = [
  { code: "IH12A-203", id: 203, name: "1年A組" },
  { code: "IH12A-204", id: 204, name: "1年B組" },
  { code: "IH12A-205", id: 205, name: "1年C組" },
  { code: "IH12B-301", id: 301, name: "2年A組" },
];
