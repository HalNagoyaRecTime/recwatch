import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { FormModal } from "~/components/ui/modal/FormModal";
import { TeamApi } from "~/features/team/api";
import type { Ranking } from "~/features/ranking/model/ranking";

type RankingBulkScoreDialogProps = {
  onClose: () => void;
  onSaved: (succeededTeamIds: readonly number[]) => void;
  rankings: readonly Ranking[];
};

type SaveOutcome = {
  succeededTeamIds: number[];
  failedTeamNames: string[];
};

/**
 * 選択した複数チームの得点をまとめて加算するモーダル。
 * 1リクエスト/チームでAPIを呼ぶため、一部失敗しても成功分は反映しつつ、
 * 失敗したチームだけを残して再試行できるようにする（二重加算を避ける）。
 */
export function RankingBulkScoreDialog({
  onClose,
  onSaved,
  rankings,
}: RankingBulkScoreDialogProps) {
  const rankingByTeamId = useMemo(
    () => new Map(rankings.map((ranking) => [ranking.teamId, ranking])),
    [rankings]
  );
  const [pendingTeamIds, setPendingTeamIds] = useState<readonly number[]>(() =>
    rankings.map((ranking) => ranking.teamId)
  );
  const [pointsInput, setPointsInput] = useState<Record<number, string>>(() =>
    Object.fromEntries(rankings.map((ranking) => [ranking.teamId, "0"]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totalSucceeded, setTotalSucceeded] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const pendingRows = pendingTeamIds
    .map((teamId) => rankingByTeamId.get(teamId))
    .filter((ranking): ranking is Ranking => ranking !== undefined);

  function parsePoints(teamId: number): number | null {
    const raw = pointsInput[teamId] ?? "";
    if (raw.trim() === "") return null;
    const value = Number(raw);
    return Number.isInteger(value) ? value : null;
  }

  async function handleSubmit() {
    const entries = pendingRows.map((ranking) => ({
      points: parsePoints(ranking.teamId),
      teamId: ranking.teamId,
    }));
    if (entries.some((entry) => entry.points === null)) {
      setValidationError("加算する得点はすべて整数で入力してください。");
      return;
    }

    setValidationError(null);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const outcome = await saveEntries(
        entries as { points: number; teamId: number }[]
      );
      if (outcome.succeededTeamIds.length > 0) {
        onSaved(outcome.succeededTeamIds);
      }
      setTotalSucceeded((count) => count + outcome.succeededTeamIds.length);

      if (outcome.failedTeamNames.length === 0) {
        setIsDone(true);
        return;
      }

      setPendingTeamIds(
        pendingRows
          .map((ranking) => ranking.teamId)
          .filter((teamId) => !outcome.succeededTeamIds.includes(teamId))
      );
      setSubmitError(
        `${outcome.failedTeamNames.join("、")}の更新に失敗しました。再度お試しください。`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveEntries(
    entries: { points: number; teamId: number }[]
  ): Promise<SaveOutcome> {
    const results = await Promise.allSettled(
      entries.map((entry) =>
        TeamApi.addTeamScore(entry.teamId, { points: entry.points })
      )
    );

    const succeededTeamIds: number[] = [];
    const failedTeamNames: string[] = [];
    results.forEach((result, index) => {
      const teamId = entries[index].teamId;
      if (result.status === "fulfilled") {
        succeededTeamIds.push(teamId);
      } else {
        failedTeamNames.push(rankingByTeamId.get(teamId)?.teamName ?? "");
      }
    });

    return {
      failedTeamNames: failedTeamNames.filter(Boolean),
      succeededTeamIds,
    };
  }

  return (
    <FormModal
      description={
        isDone
          ? undefined
          : `選択した${pendingRows.length}チームの得点に加算します`
      }
      isDismissDisabled={isSubmitting}
      onClose={onClose}
      size="xl"
      title="得点のまとめ入力"
    >
      {(requestClose) =>
        isDone ? (
          <div className="space-y-5">
            <p className="text-text-base text-sm">
              {totalSucceeded}件の得点を更新しました。
            </p>
            <div className="flex justify-end">
              <Button icon={Check} onClick={requestClose} variant="primary">
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="border-border-base app-rounded overflow-hidden border">
              <table
                aria-label="選択したチームの得点"
                className="bg-surface-base w-full table-fixed text-sm"
              >
                <thead className="text-text-muted">
                  <tr className="border-border-subtle border-b">
                    <th
                      className="px-3 py-2.5 text-left font-normal"
                      scope="col"
                    >
                      チーム
                    </th>
                    <th
                      className="w-28 px-3 py-2.5 text-right font-normal"
                      scope="col"
                    >
                      現在の得点
                    </th>
                    <th
                      className="w-32 px-3 py-2.5 text-left font-normal"
                      scope="col"
                    >
                      加算点
                    </th>
                    <th
                      className="w-28 px-3 py-2.5 text-right font-normal"
                      scope="col"
                    >
                      更新後の得点
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRows.map((ranking) => {
                    const points = parsePoints(ranking.teamId);
                    return (
                      <tr
                        className="border-border-subtle border-b last:border-b-0"
                        key={ranking.teamId}
                      >
                        <td className="text-text-base truncate px-3 py-2 font-semibold">
                          {ranking.teamName}
                        </td>
                        <td className="text-text-base px-3 py-2 text-right">
                          {ranking.score}pt
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-invalid={points === null}
                            aria-label={`${ranking.teamName}の加算点`}
                            className="border-border-base bg-surface-base text-text-base h-9 w-full [appearance:textfield] rounded-md border px-2 text-right outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            disabled={isSubmitting}
                            onChange={(event) =>
                              setPointsInput((current) => ({
                                ...current,
                                [ranking.teamId]: event.target.value,
                              }))
                            }
                            type="number"
                            value={pointsInput[ranking.teamId] ?? ""}
                          />
                        </td>
                        <td className="text-text-base px-3 py-2 text-right">
                          {points === null
                            ? "—"
                            : `${ranking.score + points}pt`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {validationError || submitError ? (
              <p className="text-tone-danger-text text-sm" role="alert">
                {validationError ?? submitError}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                disabled={isSubmitting}
                icon={X}
                onClick={requestClose}
                variant="secondary"
              >
                キャンセル
              </Button>
              <Button
                disabled={isSubmitting}
                icon={Check}
                onClick={() => void handleSubmit()}
                variant="primary"
              >
                {isSubmitting ? "保存中..." : "まとめて保存"}
              </Button>
            </div>
          </div>
        )
      }
    </FormModal>
  );
}
