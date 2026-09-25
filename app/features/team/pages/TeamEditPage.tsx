import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import {
  TeamForm,
  type TeamFormInput,
} from "~/features/team/components/TeamForm";
import { teamListTarget } from "~/features/team/application/team-navigation";
import { TeamApi } from "~/features/team/api";
import type { TeamClassOption } from "~/features/team/model/team-class-option";
import type { Team } from "~/features/team/model/team";
import { getErrorMessage } from "~/lib/client-error";

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
      await TeamApi.updateTeam(team.id, {
        teamName: input.name,
        classCodes: [...input.registeredClasses],
      });
      close();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "チーム情報の更新に失敗しました。")
      );
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
