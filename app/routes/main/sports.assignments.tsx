import { CompetitionAssignmentPage } from "~/features/sports/pages/CompetitionAssignmentPage";

export function meta() {
  return [{ title: "競技割り当て | recwatch" }];
}

export default function CompetitionAssignmentRoute() {
  return <CompetitionAssignmentPage />;
}
