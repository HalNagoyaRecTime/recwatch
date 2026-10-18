import { ArrowLeft, Check, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { getErrorMessage } from "~/lib/client-error";

import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import {
  httpEventGatheringSettingsGateway,
  httpGatheringMemberGateway,
} from "~/features/event-gatherings/api/http/event-gathering-dependencies";
import { useEventGatheringSettings } from "~/features/event-gatherings/hooks/useEventGatheringSettings";
import { useGatheringMemberCandidates } from "~/features/event-gatherings/hooks/useGatheringMemberCandidates";
import type { EventGatheringSettings } from "~/features/event-gatherings/model/event-gathering-settings";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import { httpGatheringSpotGateway } from "~/features/gathering-spots/api/http/gathering-spot-dependencies";
import { useGatheringSpots } from "~/features/gathering-spots/hooks/useGatheringSpots";
import { GatheringMemberEditor } from "./GatheringMemberEditor";
import { GatheringPendingMemberEditor } from "./GatheringPendingMemberEditor";
import { RoundCard } from "./RoundCard";

type GatheringSettingsStepProps = {
  backLabel: string;
  eventId: number;
  memberGateway?: GatheringMemberGateway;
  onBack: () => void;
  /**
   * 参加者だけを保存したとき。集合設定の保存とは別タイミングでサーバーの
   * 人数が変わるため、呼び出し元の表示にも反映させる。
   */
  onMembersSaved?: () => void;
  /** 集合設定を保存してステップを進めるとき。 */
  onSaved: (
    settings: EventGatheringSettings,
    hasNewGatherings: boolean
  ) => void;
  settingsGateway?: EventGatheringSettingsGateway;
  spotGateway?: GatheringSpotGateway;
};

/**
 * Event 配下の Round / 集合を編集して Event 単位で保存する。
 * 新規作成モーダルのステップと既存 Event の集合設定モーダルの両方から使う。
 */
export function GatheringSettingsStep({
  backLabel,
  eventId,
  memberGateway = httpGatheringMemberGateway,
  onBack,
  onMembersSaved,
  onSaved,
  settingsGateway = httpEventGatheringSettingsGateway,
  spotGateway = httpGatheringSpotGateway,
}: GatheringSettingsStepProps) {
  const settings = useEventGatheringSettings({
    eventId,
    gateway: settingsGateway,
  });
  const spotList = useGatheringSpots({ gateway: spotGateway });
  const memberCandidates = useGatheringMemberCandidates({
    gateway: memberGateway,
  });
  const [openPickerKey, setOpenPickerKey] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasCreatedGatherings, setHasCreatedGatherings] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<
    Record<string, number[]>
  >({});
  const [memberSaveError, setMemberSaveError] = useState<string | null>(null);

  const loadError = settings.loadError ?? spotList.loadError;
  const isBusy = settings.isLoading || spotList.isLoading || settings.isSaving;
  const isDisabled = isBusy || Boolean(loadError);

  function togglePicker(gatheringKey: string) {
    setOpenPickerKey((current) =>
      current === gatheringKey ? null : gatheringKey
    );
    memberCandidates.ensureLoaded();
  }

  async function handleSave() {
    const hasNewGatherings = settings.rounds.some((round) =>
      round.gatherings.some((gathering) => gathering.gatheringId === null)
    );
    const pendingAssignments = settings.rounds.flatMap((round) =>
      round.gatherings.flatMap((gathering, index) =>
        Object.hasOwn(pendingMembers, gathering.key)
          ? [
              {
                key: gathering.key,
                round: round.round,
                index,
                userIds: pendingMembers[gathering.key],
              },
            ]
          : []
      )
    );
    const saved = await settings.save();
    if (!saved) return;

    const shouldKeepEditing = hasNewGatherings || hasCreatedGatherings;
    if (hasNewGatherings) setHasCreatedGatherings(true);
    onSaved(saved, shouldKeepEditing);
    setMemberSaveError(null);

    for (const assignment of pendingAssignments) {
      const round = saved.rounds.find(
        (savedRound) => savedRound.round === assignment.round
      );
      const gathering = round?.gatherings[assignment.index];
      if (!round || !gathering) {
        setMemberSaveError(
          "集合の保存結果を確認できず、参加者を登録できませんでした。集合設定を再読み込みしてください。"
        );
        return;
      }

      try {
        const userIds = assignment.userIds.length
          ? await memberGateway.saveMembers(gathering.id, assignment.userIds)
          : [];
        const draftRound = settings.rounds.find(
          (currentRound) => currentRound.round === assignment.round
        );
        if (draftRound) {
          settings.updateGathering(draftRound.key, assignment.key, {
            savedMemberCount: userIds.length,
          });
        }
        setPendingMembers((current) => {
          const next = { ...current };
          delete next[assignment.key];
          return next;
        });
      } catch (error) {
        setMemberSaveError(
          getErrorMessage(
            error,
            "参加者の登録に失敗しました。集合設定を保存して再試行してください。"
          )
        );
        return;
      }
    }

    setOpenPickerKey(null);
    setHasSaved(true);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-text-base text-lg font-semibold">集合設定</h3>
        <p className="text-text-muted mt-1 text-sm">
          Roundごとに集合時間・集合場所・参加者を設定します。
        </p>
      </div>

      {hasSaved ? (
        <p className="text-tone-success-text text-sm" role="status">
          集合設定を保存しました。続けて参加者を設定できます。
        </p>
      ) : null}
      {memberSaveError ? (
        <p className="text-tone-danger-text text-base" role="alert">
          {memberSaveError}
        </p>
      ) : null}

      {loadError ? (
        <p className="text-tone-danger-text text-base" role="alert">
          {loadError}
        </p>
      ) : settings.isLoading || spotList.isLoading ? (
        <p className="text-text-muted text-sm">集合設定を読み込み中...</p>
      ) : (
        <div className="space-y-4">
          {settings.rounds.map((round) => (
            <RoundCard
              key={round.key}
              disabled={isDisabled}
              errors={settings.validationErrors.filter(
                (error) => error.roundKey === round.key
              )}
              onAddGathering={() => {
                setHasSaved(false);
                settings.addGathering(round.key);
              }}
              onChangeGathering={(gatheringKey, patch) => {
                setHasSaved(false);
                settings.updateGathering(round.key, gatheringKey, patch);
              }}
              onChangeRoundStartTime={(startTime) => {
                setHasSaved(false);
                settings.updateRoundStartTime(round.key, startTime);
              }}
              onChangeRoundNumber={(roundNumber) => {
                setHasSaved(false);
                settings.updateRoundNumber(round.key, roundNumber);
              }}
              onRemove={() => {
                setHasSaved(false);
                setPendingMembers((current) => {
                  const next = { ...current };
                  for (const gathering of round.gatherings) {
                    delete next[gathering.key];
                  }
                  return next;
                });
                if (
                  round.gatherings.some(
                    (gathering) => gathering.key === openPickerKey
                  )
                ) {
                  setOpenPickerKey(null);
                }
                settings.removeRound(round.key);
              }}
              onRemoveGathering={(gatheringKey) => {
                setHasSaved(false);
                setPendingMembers((current) => {
                  const next = { ...current };
                  delete next[gatheringKey];
                  return next;
                });
                if (openPickerKey === gatheringKey) setOpenPickerKey(null);
                settings.removeGathering(round.key, gatheringKey);
              }}
              onTogglePicker={togglePicker}
              openPickerKey={openPickerKey}
              pendingMemberCounts={Object.fromEntries(
                Object.entries(pendingMembers).map(([key, userIds]) => [
                  key,
                  userIds.length,
                ])
              )}
              renderPicker={(gathering) =>
                gathering.gatheringId === null ||
                Object.hasOwn(pendingMembers, gathering.key) ? (
                  <GatheringPendingMemberEditor
                    candidates={memberCandidates.candidates}
                    candidatesError={memberCandidates.loadError}
                    initialUserIds={pendingMembers[gathering.key] ?? []}
                    isCandidatesLoading={memberCandidates.isLoading}
                    onCancel={() => setOpenPickerKey(null)}
                    onConfirm={(userIds) => {
                      setPendingMembers((current) => ({
                        ...current,
                        [gathering.key]: userIds,
                      }));
                      setHasSaved(false);
                      setOpenPickerKey(null);
                    }}
                  />
                ) : (
                  <GatheringMemberEditor
                    key={gathering.gatheringId}
                    candidates={memberCandidates.candidates}
                    candidatesError={memberCandidates.loadError}
                    gatheringId={gathering.gatheringId}
                    gateway={memberGateway}
                    isCandidatesLoading={memberCandidates.isLoading}
                    onCancel={() => setOpenPickerKey(null)}
                    onSaved={(userIds) => {
                      // 参加者は集合設定とは別に保存済みなので、削除可否の判断に使う人数だけ反映する
                      settings.updateGathering(round.key, gathering.key, {
                        savedMemberCount: userIds.length,
                      });
                      setOpenPickerKey(null);
                      // モーダルを閉じずに、呼び出し元が持つ人数も合わせる
                      onMembersSaved?.();
                    }}
                  />
                )
              }
              spots={spotList.spots}
              value={round}
            />
          ))}
          {settings.rounds.length === 0 ? (
            <p className="text-text-muted text-sm">
              まだRoundがありません。「Roundを追加」から集合設定を始めてください。
            </p>
          ) : null}
          <Button
            disabled={isDisabled}
            icon={Plus}
            onClick={() => {
              setHasSaved(false);
              settings.addRound();
            }}
            size="md"
            type="button"
            variant="secondary"
          >
            Roundを追加
          </Button>
        </div>
      )}

      {settings.saveError ? (
        <p className="text-tone-danger-text text-base" role="alert">
          {settings.saveError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          disabled={settings.isSaving}
          icon={ArrowLeft}
          onClick={onBack}
          size="lg"
          type="button"
          variant="secondary"
        >
          {hasSaved ? "イベント詳細へ戻る" : backLabel}
        </Button>
        <Button
          disabled={isDisabled}
          icon={Check}
          onClick={() => void handleSave()}
          size="lg"
          type="button"
          variant="primary"
        >
          {settings.isSaving ? "保存中..." : "集合設定を保存"}
        </Button>
      </div>
    </div>
  );
}
