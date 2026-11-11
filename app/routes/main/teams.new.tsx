import type { TeamClassOption } from "~/features/team/model/team-class-option";
import { TeamCreatePage } from "~/features/team/pages/TeamCreatePage";
import { createPageTitle } from "~/lib/page-title";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("チームの新規登録") }];
}

export default function TeamCreateRoute() {
  const classOptions = useManagementRouteOptions<TeamClassOption>();
  const closeModal = useManagementModalReturn();

  return (
    <TeamCreatePage
      classOptionState={classOptions}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
    />
  );
}
