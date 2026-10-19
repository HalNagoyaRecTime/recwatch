import { useState } from "react";

import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import { FormModal } from "~/components/ui/modal/FormModal";
import {
  TeamForm,
  type TeamFormInput,
} from "~/features/team/components/TeamForm";
import { TeamApi } from "~/features/team/api";
import type { TeamClassOption } from "~/features/team/model/team-class-option";
import type { Team } from "~/features/team/model/team";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";
import { getErrorMessage } from "~/lib/client-error";

type TeamEditPageProps = {
  classOptionState: ManagementOptionState<TeamClassOption>;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  team: Team;
};

export function TeamEditPage({
  classOptionState,
  onClose,
  onSaved,
  team,
}: TeamEditPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(input: TeamFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await TeamApi.updateTeam(team.id, {
        teamName: input.name,
        classCodes: [...input.registeredClasses],
      });
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "チーム情報の更新に失敗しました。")
      );
      setIsSubmitting(false);
      return;
    }
    await onSaved();
  }

  return (
    <FormModal
      description={`id: ${team.id}`}
      onClose={() => void onClose()}
      title="チーム情報を編集"
    >
      {(requestClose) => (
        <>
          <ManagementOptionFeedback
            label="登録クラス候補"
            state={classOptionState}
          />
          {!classOptionState.isLoading && !classOptionState.error ? (
            <TeamForm
              availableClasses={classOptionState.items}
              initialTeam={team}
              isSubmitting={isSubmitting}
              onCancel={requestClose}
              onSubmit={handleSubmit}
              submitError={submitError}
            />
          ) : null}
        </>
      )}
    </FormModal>
  );
}
