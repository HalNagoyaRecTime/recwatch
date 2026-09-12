import {
  MAX_ROUND,
  MIN_ROUND,
  type EventGatheringSettingsWriteInput,
  type GatheringWriteInput,
  type RoundDraft,
  type RoundWriteInput,
} from "./event-gathering-settings";

/**
 * 下書きのどこに問題があるかを行単位で示す。
 * gatheringKey が無いものは Round 自体の問題。
 */
export type EventGatheringSettingsValidationError = {
  roundKey: string;
  gatheringKey?: string;
  message: string;
};

export type EventGatheringSettingsValidationResult =
  | { input: EventGatheringSettingsWriteInput }
  | { errors: EventGatheringSettingsValidationError[] };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * 保存 API と同じ制約を送信前に確認する。
 * Round 番号は 1〜99 で重複なし、各 Round に集合が 1 件以上、集合時刻と集合場所は必須。
 */
export function validateEventGatheringSettings(
  rounds: readonly RoundDraft[]
): EventGatheringSettingsValidationResult {
  const errors: EventGatheringSettingsValidationError[] = [];
  const seenRounds = new Set<number>();
  const roundInputs: RoundWriteInput[] = [];

  for (const round of rounds) {
    if (
      !Number.isInteger(round.round) ||
      round.round < MIN_ROUND ||
      round.round > MAX_ROUND
    ) {
      errors.push({
        roundKey: round.key,
        message: `Round番号は${MIN_ROUND}〜${MAX_ROUND}の整数で入力してください。`,
      });
    } else if (seenRounds.has(round.round)) {
      errors.push({
        roundKey: round.key,
        message: `Round ${round.round} が重複しています。`,
      });
    }
    seenRounds.add(round.round);

    if (round.gatherings.length === 0) {
      errors.push({
        roundKey: round.key,
        message: "集合を1件以上追加してください。",
      });
    }

    const gatheringInputs: GatheringWriteInput[] = [];
    for (const gathering of round.gatherings) {
      if (!TIME_PATTERN.test(gathering.time)) {
        errors.push({
          roundKey: round.key,
          gatheringKey: gathering.key,
          message: "集合時間を入力してください。",
        });
      }
      if (gathering.spotId === null) {
        errors.push({
          roundKey: round.key,
          gatheringKey: gathering.key,
          message: "集合場所を選択してください。",
        });
        continue;
      }
      gatheringInputs.push({
        gatheringId: gathering.gatheringId,
        time: gathering.time,
        spotId: gathering.spotId,
      });
    }

    roundInputs.push({ round: round.round, gatherings: gatheringInputs });
  }

  if (errors.length > 0) return { errors };

  return { input: { rounds: roundInputs } };
}
