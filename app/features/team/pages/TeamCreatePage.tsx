import { useState } from "react";

import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import { FormModal } from "~/components/ui/modal/FormModal";
import {
  TeamForm,
  type TeamFormInput,
} from "~/features/team/components/TeamForm";
import { TeamApi } from "~/features/team/api";
import type { TeamClassOption } from "~/features/team/model/team-class-option";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";
import { getErrorMessage } from "~/lib/client-error";

type TeamCreatePageProps = {
  classOptionState: ManagementOptionState<TeamClassOption>;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
};

export function TeamCreatePage({
  classOptionState,
  onClose,
  onSaved,
}: TeamCreatePageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(input: TeamFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await TeamApi.createTeam({
        classCodes: [...input.registeredClasses],
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "チームの登録に失敗しました。"));
      setIsSubmitting(false);
      return;
    }
    await onSaved();
  }

  return (
    <FormModal
      description="登録クラスを選択して登録します。チーム名はクラスコードから自動設定されます。"
      onClose={() => void onClose()}
      title="チームを新規登録"
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
