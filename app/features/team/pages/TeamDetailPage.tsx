import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { FormModal } from "~/components/ui/modal/FormModal";
import {
  teamEditTarget,
  teamListTarget,
} from "~/features/team/application/team-navigation";
import type { Team } from "~/features/team/model/team";
import { formatDisplayDateTime } from "~/lib/format-display-date-time";

export function TeamDetailPage({ team }: { team: Team }) {
  const navigate = useNavigate();
  const location = useLocation();

  function close() {
    navigate(teamListTarget(location.search));
  }

  return (
    <FormModal
      description={`id: ${team.id}`}
      onClose={close}
      title="チーム詳細"
    >
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-text-muted">登録クラス</dt>
          <dd className="text-text-base mt-1">
            {team.registeredClasses.length > 0
              ? team.registeredClasses.join("・")
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">チーム名</dt>
          <dd className="text-text-base mt-1 font-medium">{team.name}</dd>
        </div>
        <div>
          <dt className="text-text-muted">登録日</dt>
          <dd className="text-text-base mt-1">
            {formatDisplayDateTime(team.registeredAt)}
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">更新日時</dt>
          <dd className="text-text-base mt-1">
            {formatDisplayDateTime(team.updatedAt)}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={close} type="button" variant="secondary">
          閉じる
        </Button>
        <Button
          onClick={() => navigate(teamEditTarget(team.id, location.search))}
          type="button"
          variant="primary"
        >
          編集
        </Button>
      </div>
    </FormModal>
  );
}
