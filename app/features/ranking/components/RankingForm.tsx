import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type { Ranking } from "~/features/ranking/model/ranking";

export type RankingFormInput = {
  score: number;
};

export function RankingForm({
  initialRanking,
  isSubmitting,
  onCancel,
  onSubmit,
  submitError,
}: {
  initialRanking: Ranking;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: RankingFormInput) => void | Promise<void>;
  submitError: string | null;
}) {
  const [score, setScore] = useState(String(initialRanking.score));
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedScore = Number(score);
    if (
      score.trim() === "" ||
      !Number.isInteger(normalizedScore) ||
      normalizedScore < 0
    ) {
      setValidationError("得点は0以上の整数で入力してください。");
      return;
    }

    setValidationError(null);
    void onSubmit({ score: normalizedScore });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold" htmlFor="ranking-score">
        得点
        <input
          className="border-border-base bg-surface-base text-text-base mt-1 h-10 w-full rounded-md border px-3 outline-none"
          id="ranking-score"
          min="0"
          onChange={(event) => setScore(event.target.value)}
          step="1"
          type="number"
          value={score}
        />
      </label>
      {validationError || submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {validationError ?? submitError}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">
          キャンセル
        </Button>
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
