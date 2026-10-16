import { useState } from "react";

import { FormModal } from "~/components/ui/modal/FormModal";
import {
  RankingForm,
  type RankingFormInput,
} from "~/features/ranking/components/RankingForm";
import { TeamApi } from "~/features/team/api";
import type { Ranking } from "~/features/ranking/model/ranking";
import { getErrorMessage } from "~/lib/client-error";

type RankingEditPageProps = {
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  ranking: Ranking;
};

export function RankingEditPage({
  onClose,
  onSaved,
  ranking,
}: RankingEditPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(input: RankingFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await TeamApi.addTeamScore(ranking.teamId, { points: input.points });
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "ランキングの更新に失敗しました。")
      );
      setIsSubmitting(false);
      return;
    }
    await onSaved();
  }

  return (
    <FormModal
      description={`チーム名: ${ranking.teamName}`}
      onClose={() => void onClose()}
      title="得点編集"
    >
      {(requestClose) => (
        <RankingForm
          initialRanking={ranking}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      )}
    </FormModal>
  );
}
