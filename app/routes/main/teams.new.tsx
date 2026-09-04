import { createPageTitle } from "~/lib/page-title";
import { mockTeamClasses } from "~/features/team/mock/team-class-data";
import { TeamCreatePage } from "~/features/team/pages/TeamCreatePage";

export function meta() {
  return [{ title: createPageTitle("チームの新規登録") }];
}

export default function TeamCreateRoute() {
  return <TeamCreatePage availableClasses={mockTeamClasses} />;
}
