import { ArrowLeft, Check, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";

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
import { GatheringMemberPicker } from "./GatheringMemberPicker";
import { RoundCard } from "./RoundCard";

type GatheringSettingsStepProps = {
  backLabel: string;
  eventId: number;
  memberGateway?: GatheringMemberGateway;
  onBack: () => void;
  onSaved: (settings: EventGatheringSettings) => void;
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
    const saved = await settings.save();
    if (saved) onSaved(saved);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-text-base text-lg font-semibold">集合設定</h3>
        <p className="text-text-muted mt-1 text-sm">
          Roundごとに集合時間・集合場所・参加者を設定します。
        </p>
      </div>

      {loadError ? (
        <p className="text-tone-danger-text text-base" role="alert">
          {loadError}
        </p>
      ) : settings.isLoading || spotList.isLoading ? (
        <p className="text-text-muted text-sm">集合設定を読み込み中...</p>
      ) : (
        <div className="space-y-4">
          {settings.rounds.map((round, index) => (
            <RoundCard
              key={round.key}
              disabled={isDisabled}
              errors={settings.validationErrors.filter(
                (error) => error.roundKey === round.key
              )}
              onAddGathering={() => settings.addGathering(round.key)}
              onChangeGathering={(gatheringKey, patch) =>
                settings.updateGathering(round.key, gatheringKey, patch)
              }
              onChangeRoundNumber={(roundNumber) =>
                settings.updateRoundNumber(round.key, roundNumber)
              }
              onRemove={() => {
                if (round.gatherings.some((g) => g.key === openPickerKey)) {
                  setOpenPickerKey(null);
                }
                settings.removeRound(round.key);
              }}
              onRemoveGathering={(gatheringKey) => {
                if (openPickerKey === gatheringKey) setOpenPickerKey(null);
                settings.removeGathering(round.key, gatheringKey);
              }}
              onTogglePicker={togglePicker}
              openPickerKey={openPickerKey}
              position={index + 1}
              renderPicker={(gathering) => (
                <GatheringMemberPicker
                  candidates={memberCandidates.candidates}
                  isLoading={memberCandidates.isLoading}
                  loadError={memberCandidates.loadError}
                  onChange={(memberUserIds) =>
                    settings.updateGathering(round.key, gathering.key, {
                      memberUserIds,
                    })
                  }
                  onClose={() => setOpenPickerKey(null)}
                  selectedUserIds={gathering.memberUserIds}
                />
              )}
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
            onClick={settings.addRound}
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
          {backLabel}
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
