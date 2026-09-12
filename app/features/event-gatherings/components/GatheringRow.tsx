import { Users, X } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { cn } from "~/lib/cn";

import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";
import type { GatheringDraft } from "~/features/event-gatherings/model/event-gathering-settings";

type GatheringRowProps = {
  /**
   * 削除ボタンを出すかどうか。Round には集合が 1 件必要なため最後の 1 件には出さず、
   * 参加者が登録済みの集合も保存 API が削除を拒否するため出さない。
   */
  canRemove: boolean;
  disabled: boolean;
  errors: readonly string[];
  isPickerOpen: boolean;
  onChange: (patch: Partial<Pick<GatheringDraft, "time" | "spotId">>) => void;
  onRemove: () => void;
  onTogglePicker: () => void;
  spots: readonly GatheringSpot[];
  value: GatheringDraft;
};

const NO_SPOT = "";

export function GatheringRow({
  canRemove,
  disabled,
  errors,
  isPickerOpen,
  onChange,
  onRemove,
  onTogglePicker,
  spots,
  value,
}: GatheringRowProps) {
  const selectedCount = value.memberUserIds.length;
  const memberLabel = `${selectedCount}人選択`;
  const isLockedByMembers = value.savedMemberCount > 0;

  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto_auto] sm:items-end">
        <label className={labelClassName}>
          集合時間
          <input
            aria-label="集合時間"
            className={inputClassName}
            disabled={disabled}
            onChange={(event) => onChange({ time: event.currentTarget.value })}
            type="time"
            value={value.time}
          />
        </label>
        <label className={labelClassName}>
          集合場所
          {/* モーダル内では共有 Select のプルダウンが枠をはみ出すため、既存モーダルと同じネイティブ select を使う */}
          <select
            aria-label="集合場所"
            className={inputClassName}
            disabled={disabled}
            onChange={(event) => {
              const next = event.currentTarget.value;
              onChange({ spotId: next === NO_SPOT ? null : Number(next) });
            }}
            value={value.spotId === null ? NO_SPOT : String(value.spotId)}
          >
            <option value={NO_SPOT}>集合場所を選択</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
        </label>
        <div className={labelClassName}>
          参加者
          <div className="mt-1.5 flex items-center gap-2">
            <Button
              aria-expanded={isPickerOpen}
              disabled={disabled}
              icon={Users}
              onClick={onTogglePicker}
              size="sm"
              type="button"
              variant={isPickerOpen ? "primary" : "secondary"}
            >
              メンバーを選択
            </Button>
            <span
              className={cn(
                "app-rounded bg-surface-muted text-text-muted px-2 py-1 text-xs font-medium whitespace-nowrap",
                selectedCount > 0 && "bg-tone-success-bg text-tone-success-text"
              )}
            >
              {memberLabel}
            </span>
          </div>
        </div>
        {canRemove ? (
          <Button
            aria-label="この集合を削除"
            disabled={disabled}
            icon={X}
            iconOnly
            onClick={onRemove}
            size="sm"
            type="button"
            variant="ghost"
          />
        ) : null}
      </div>
      {isLockedByMembers ? (
        <p className="text-text-muted text-xs">
          参加者が登録されているため、この集合は削除できません。
        </p>
      ) : null}
      {errors.length > 0 ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

const labelClassName = "text-text-base block text-sm font-medium";
const inputClassName =
  "app-rounded border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-9 w-full border px-3 text-sm outline-none disabled:opacity-50";
