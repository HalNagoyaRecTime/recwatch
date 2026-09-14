import { Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";

import type { EventGatheringSettings } from "~/features/event-gatherings/model/event-gathering-settings";

type GatheringSettingsSavedStepProps = {
  onClose: () => void;
  settings: EventGatheringSettings;
};

/** 集合設定の保存が完了したことを示し、一覧へ戻す。 */
export function GatheringSettingsSavedStep({
  onClose,
  settings,
}: GatheringSettingsSavedStepProps) {
  const gatheringCount = settings.rounds.reduce(
    (total, round) => total + round.gatherings.length,
    0
  );

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span className="bg-tone-success-bg text-tone-success-text inline-flex size-16 items-center justify-center rounded-full">
        <Check aria-hidden="true" className="size-8" />
      </span>
      <div className="space-y-2">
        <p className="text-text-base text-xl font-semibold">
          集合設定を保存しました
        </p>
        <p className="text-text-muted text-base">
          {settings.rounds.length}Round・{gatheringCount}
          件の集合を登録しました。
        </p>
      </div>
      <Button onClick={onClose} size="lg" variant="primary">
        一覧へ戻る
      </Button>
    </div>
  );
}
