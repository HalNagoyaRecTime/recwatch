import { useLoaderData, useRouteError } from "react-router";

import { TeamApi } from "~/features/team/api";
import type { TeamClassOption } from "~/features/team/model/team-class-option";
import { TeamEditPage } from "~/features/team/pages/TeamEditPage";
import { createPageTitle } from "~/lib/page-title";
import { parsePositiveIntegerRouteParam } from "~/lib/parse-positive-integer-route-param";
import { ManagementModalRouteError } from "~/routes/main/management-modal-route-error";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("チームの編集") }];
}

export async function clientLoader({ params }: { params: { id?: string } }) {
  const teamId = parsePositiveIntegerRouteParam(params.id);
  if (teamId === null) {
    throw new Response("チームが見つかりません。", { status: 404 });
  }

  return { team: await TeamApi.getTeamById(teamId) };
}

export function ErrorBoundary() {
  const closeModal = useManagementModalReturn();
  return (
    <ManagementModalRouteError
      error={useRouteError()}
      onClose={() => closeModal()}
      title="チーム情報を読み込めません"
    />
  );
}

export default function TeamEditRoute() {
  const { team } = useLoaderData<typeof clientLoader>();
  const classOptions = useManagementRouteOptions<TeamClassOption>();
  const closeModal = useManagementModalReturn();

  return (
    <TeamEditPage
      classOptionState={classOptions}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      team={team}
    />
  );
}
