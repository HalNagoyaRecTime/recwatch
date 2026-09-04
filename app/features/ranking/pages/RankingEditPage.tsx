import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import {
  RankingForm,
  type RankingFormInput,
} from "~/features/ranking/components/RankingForm";
import { rankingListTarget } from "~/features/ranking/application/ranking-navigation";
import { updateRanking } from "~/features/ranking/mock/ranking-store";
import type { Ranking } from "~/features/ranking/model/ranking";

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
      const updated = updateRanking(ranking.rank, input);
      if (!updated) throw new Error("ranking not found");
      close();
    } catch {
      setSubmitError("ランキングの更新に失敗しました。");
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      description={`順位: ${ranking.rank}`}
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
