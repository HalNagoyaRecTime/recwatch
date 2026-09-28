import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import {
  RankingForm,
  type RankingFormInput,
} from "~/features/ranking/components/RankingForm";
import { rankingListTarget } from "~/features/ranking/application/ranking-navigation";
import { TeamApi } from "~/features/team/api";
import type { Ranking } from "~/features/ranking/model/ranking";
import { getErrorMessage } from "~/lib/client-error";

export function RankingEditPage({ ranking }: { ranking: Ranking }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function close() {
    navigate(rankingListTarget(location.search));
  }

  async function handleSubmit(input: RankingFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await TeamApi.addTeamScore(ranking.teamId, { points: input.points });
      close();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "ランキングの更新に失敗しました。")
      );
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      description={`チーム名: ${ranking.teamName}`}
      onClose={close}
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
