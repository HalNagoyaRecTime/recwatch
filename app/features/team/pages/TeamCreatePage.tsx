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
import { getErrorMessage } from "~/lib/client-error";

export function TeamCreatePage({
  availableClasses,
}: {
  availableClasses: readonly TeamClassOption[];
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
      await TeamApi.createTeam({
        teamName: input.name,
        classCodes: [...input.registeredClasses],
      });
      close();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "チームの登録に失敗しました。"));
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      description="チーム名と登録クラスを選択して登録します。"
      onClose={close}
      title="チームを新規登録"
    >
      {(requestClose) => (
        <TeamForm
          availableClasses={availableClasses}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      )}
    </FormModal>
  );
}
