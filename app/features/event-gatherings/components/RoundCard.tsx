import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "~/components/ui/button/Button";

import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";
import type {
  GatheringDraft,
  RoundDraft,
} from "~/features/event-gatherings/model/event-gathering-settings";
import {
  canRemoveGathering,
  canRemoveRound,
  MAX_ROUND,
  MIN_ROUND,
} from "~/features/event-gatherings/model/event-gathering-settings";
import type { EventGatheringSettingsValidationError } from "~/features/event-gatherings/model/validate-event-gathering-settings";
import { GatheringRow } from "./GatheringRow";

type RoundCardProps = {
  disabled: boolean;
  errors: readonly EventGatheringSettingsValidationError[];
  onAddGathering: () => void;
  onChangeGathering: (
    gatheringKey: string,
    patch: Partial<Pick<GatheringDraft, "time" | "spotId">>
  ) => void;
  onChangeRoundNumber: (roundNumber: number) => void;
  onRemove: () => void;
  onRemoveGathering: (gatheringKey: string) => void;
  onTogglePicker: (gatheringKey: string) => void;
  openPickerKey: string | null;
  position: number;
  renderPicker: (gathering: GatheringDraft) => ReactNode;
  spots: readonly GatheringSpot[];
  value: RoundDraft;
};

export function RoundCard({
  disabled,
  errors,
  onAddGathering,
  onChangeGathering,
  onChangeRoundNumber,
  onRemove,
  onRemoveGathering,
  onTogglePicker,
  openPickerKey,
  position,
  renderPicker,
  spots,
  value,
}: RoundCardProps) {
  const roundErrors = errors.filter((error) => !error.gatheringKey);
  const isRoundRemovable = canRemoveRound(value);

  return (
    <section
      aria-label={`Round ${value.round}`}
      className="border-border-base app-rounded space-y-4 border p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-primary text-text-base-inverse inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold">
            {position}
          </span>
          <h3 className="text-text-base text-base font-semibold">
            Round {value.round}
          </h3>
        </div>
        <Button
          disabled={disabled || !isRoundRemovable}
          icon={Trash2}
          onClick={onRemove}
          size="sm"
          title={
            isRoundRemovable
              ? undefined
              : "参加者が登録されている集合があるため削除できません"
          }
          type="button"
          variant="danger"
        >
          削除
        </Button>
      </div>

      <label className="text-text-base block text-sm font-medium">
        Round番号
        <input
          aria-label={`Round ${value.round} の番号`}
          className="app-rounded border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-9 w-24 border px-3 text-sm outline-none disabled:opacity-50"
          disabled={disabled}
          max={MAX_ROUND}
          min={MIN_ROUND}
          onChange={(event) =>
            onChangeRoundNumber(event.currentTarget.valueAsNumber)
          }
          type="number"
          value={Number.isNaN(value.round) ? "" : value.round}
        />
      </label>
      {roundErrors.length > 0 ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {roundErrors.map((error) => error.message).join(" ")}
        </p>
      ) : null}

      <div className="space-y-4">
        {value.gatherings.map((gathering) => (
          <div key={gathering.key} className="space-y-3">
            <GatheringRow
              canRemove={
                value.gatherings.length > 1 && canRemoveGathering(gathering)
              }
              disabled={disabled}
              errors={errors
                .filter((error) => error.gatheringKey === gathering.key)
                .map((error) => error.message)}
              isPickerOpen={openPickerKey === gathering.key}
              onChange={(patch) => onChangeGathering(gathering.key, patch)}
              onRemove={() => onRemoveGathering(gathering.key)}
              onTogglePicker={() => onTogglePicker(gathering.key)}
              spots={spots}
              value={gathering}
            />
            {openPickerKey === gathering.key ? renderPicker(gathering) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={disabled}
          icon={Plus}
          onClick={onAddGathering}
          size="sm"
          type="button"
          variant="secondary"
        >
          集合場所を追加
        </Button>
      </div>
    </section>
  );
}
