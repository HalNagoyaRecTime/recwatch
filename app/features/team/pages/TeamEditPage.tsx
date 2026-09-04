import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import {
  TeamForm,
  type TeamFormInput,
} from "~/features/team/components/TeamForm";
import { teamListTarget } from "~/features/team/application/team-navigation";
import { updateTeam } from "~/features/team/mock/team-store";
import type { TeamClassOption } from "~/features/team/mock/team-class-data";
import type { Team } from "~/features/team/model/team";

export function TeamEditPage({
  availableClasses,
  team,
}: {
  availableClasses: readonly TeamClassOption[];
  team: Team;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function close() {
    navigate(teamListTarget(location.search));
  }

  async function handleSubmit(input: TeamFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const updated = updateTeam(team.id, input);
      if (!updated) throw new Error("team not found");
      close();
    } catch {
      setSubmitError("チーム情報の更新に失敗しました。");
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      description={`id: ${team.id}`}
      onClose={close}
      title="チーム情報を編集"
    >
      {(requestClose) => (
        <TeamForm
          availableClasses={availableClasses}
          initialTeam={team}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      )}
    </FormModal>
  );
}
