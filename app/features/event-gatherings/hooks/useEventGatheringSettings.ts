import { useCallback, useEffect, useState } from "react";

import { ApiClientError } from "~/lib/api-client-error";
import { getErrorMessage } from "~/lib/client-error";

import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import {
  createEmptyGatheringDraft,
  createEmptyRoundDraft,
  toRoundDrafts,
  type EventGatheringSettings,
  type GatheringDraft,
  type RoundDraft,
} from "~/features/event-gatherings/model/event-gathering-settings";
import {
  validateEventGatheringSettings,
  type EventGatheringSettingsValidationError,
} from "~/features/event-gatherings/model/validate-event-gathering-settings";

type UseEventGatheringSettingsOptions = {
  eventId: number;
  gateway: EventGatheringSettingsGateway;
};

const LOAD_ERROR_MESSAGE = "集合設定の取得に失敗しました。";
const SAVE_ERROR_MESSAGE = "集合設定の保存に失敗しました。";
// 参加者がいる集合は画面上で削除できないため、通常はここに来ない。
// 別の画面で参加者が追加された直後に保存した場合だけ発生する。
const GATHERING_IN_USE_MESSAGE =
  "参加者が登録されている集合は削除できません。集合設定を開き直して最新の状態を確認してください。";

/**
 * Event 単位の集合設定を読み込み、編集中の下書きと保存を扱う。
 * 保存に失敗しても下書きはそのまま残し、修正して再試行できるようにする。
 */
export function useEventGatheringSettings({
  eventId,
  gateway,
}: UseEventGatheringSettingsOptions) {
  const [rounds, setRounds] = useState<RoundDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    EventGatheringSettingsValidationError[]
  >([]);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(async () => {
      if (!isCurrent) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const settings = await gateway.load(eventId);
        if (isCurrent) setRounds(toRoundDrafts(settings));
      } catch (error) {
        if (isCurrent) setLoadError(getErrorMessage(error, LOAD_ERROR_MESSAGE));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [eventId, gateway]);

  const updateRound = useCallback(
    (roundKey: string, updater: (round: RoundDraft) => RoundDraft) => {
      setRounds((current) =>
        current.map((round) =>
          round.key === roundKey ? updater(round) : round
        )
      );
    },
    []
  );

  const addRound = useCallback(() => {
    setRounds((current) => [...current, createEmptyRoundDraft(current)]);
  }, []);

  const removeRound = useCallback((roundKey: string) => {
    setRounds((current) => current.filter((round) => round.key !== roundKey));
  }, []);

  const updateRoundNumber = useCallback(
    (roundKey: string, roundNumber: number) => {
      updateRound(roundKey, (round) => ({ ...round, round: roundNumber }));
    },
    [updateRound]
  );

  const addGathering = useCallback(
    (roundKey: string) => {
      updateRound(roundKey, (round) => ({
        ...round,
        gatherings: [...round.gatherings, createEmptyGatheringDraft()],
      }));
    },
    [updateRound]
  );

  const removeGathering = useCallback(
    (roundKey: string, gatheringKey: string) => {
      updateRound(roundKey, (round) => ({
        ...round,
        gatherings: round.gatherings.filter(
          (gathering) => gathering.key !== gatheringKey
        ),
      }));
    },
    [updateRound]
  );

  const updateGathering = useCallback(
    (
      roundKey: string,
      gatheringKey: string,
      patch: Partial<Pick<GatheringDraft, "time" | "spotId" | "memberUserIds">>
    ) => {
      updateRound(roundKey, (round) => ({
        ...round,
        gatherings: round.gatherings.map((gathering) =>
          gathering.key === gatheringKey
            ? { ...gathering, ...patch }
            : gathering
        ),
      }));
    },
    [updateRound]
  );

  const save = useCallback(async (): Promise<EventGatheringSettings | null> => {
    const result = validateEventGatheringSettings(rounds);
    if ("errors" in result) {
      setValidationErrors(result.errors);
      setSaveError(null);
      return null;
    }

    setValidationErrors([]);
    setIsSaving(true);
    setSaveError(null);
    try {
      return await gateway.save(eventId, result.input);
    } catch (error) {
      setSaveError(toSaveErrorMessage(error));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [eventId, gateway, rounds]);

  return {
    rounds,
    isLoading,
    loadError,
    isSaving,
    saveError,
    validationErrors,
    addRound,
    removeRound,
    updateRoundNumber,
    addGathering,
    removeGathering,
    updateGathering,
    save,
  };
}

function toSaveErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.code === "GATHERING_IN_USE") {
    return GATHERING_IN_USE_MESSAGE;
  }
  return getErrorMessage(error, SAVE_ERROR_MESSAGE);
}
