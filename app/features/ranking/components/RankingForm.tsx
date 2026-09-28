import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type { Ranking } from "~/features/ranking/model/ranking";

export type RankingFormInput = {
  points: number;
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
  const [points, setPoints] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPoints = Number(points);
    if (points.trim() === "" || !Number.isInteger(normalizedPoints)) {
      setValidationError("加算する得点は整数で入力してください。");
      return;
    }

    setValidationError(null);
    void onSubmit({ points: normalizedPoints });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <p className="text-text-muted text-sm">
        現在の得点: {initialRanking.score}pt
      </p>
      <label className="block text-sm font-semibold" htmlFor="ranking-points">
        加算する得点
        <input
          className="border-border-base bg-surface-base text-text-base mt-1 h-10 w-full rounded-md border px-3 outline-none"
          id="ranking-points"
          onChange={(event) => setPoints(event.target.value)}
          step="1"
          type="number"
          value={points}
        />
      </label>
      <p className="text-text-muted text-xs">
        訂正する場合は負の値を入力してください。
      </p>
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
