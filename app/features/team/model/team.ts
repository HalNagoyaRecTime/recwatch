export type Team = {
  id: number;
  name: string;
  registeredClasses: readonly string[];
  scores: number;
  registeredAt: string;
  updatedAt: string;
};
