import { BellIcon, BellOffIcon } from "lucide-react";
import type { FormEvent } from "react";

import { cn } from "~/lib/cn";

import type { ScheduleDraft, ScheduleType } from "../model/schedule-draft";
import { scheduleTypeLabels } from "../model/schedule-draft";
import type { ScheduleDraftErrors } from "../model/schedule-draft-validation";
import { isScheduleDraftSubmittable } from "../model/schedule-draft-validation";
import type { ScheduleFormOptions } from "../model/schedule-option";
import { scheduleTimeOptions } from "../model/schedule-time-options";

type ScheduleFormProps = {
  draft: ScheduleDraft;
  errors: ScheduleDraftErrors;
  options: ScheduleFormOptions;
  isSubmitting: boolean;
  submitLabel?: string;
  onChange: (draft: ScheduleDraft) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const fieldClassName =
  "w-full rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] px-3.5 text-sm text-[color:var(--text-1)] outline-none transition placeholder:text-[color:var(--text-3)] focus:border-[color:var(--brand-1)] focus:ring-2 focus:ring-[color:var(--surface-brand-soft)]";

const scheduleTypes = Object.entries(scheduleTypeLabels) as Array<
  [ScheduleType, string]
>;

export function ScheduleForm({
  draft,
  errors,
  options,
  isSubmitting,
  submitLabel = "登録する",
  onChange,
  onReset,
  onSubmit,
}: ScheduleFormProps) {
  const canSubmit = isScheduleDraftSubmittable(draft);
  const isGathering = draft.type === "gathering";

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <fieldset>
        <legend className="text-sm font-semibold">
          種別<span className="ml-0.5 text-red-500">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {scheduleTypes.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={draft.type === value}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium transition",
                draft.type === value
                  ? "border-[color:var(--brand-button-1)] bg-[color:var(--surface-brand-soft)] text-[color:var(--brand-1)]"
                  : "border-[color:var(--border-2)] text-[color:var(--text-2)] hover:bg-[color:var(--surface-2)]"
              )}
              onClick={() => onChange({ ...draft, type: value })}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.type ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.type}</p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">
          開催時間<span className="ml-0.5 text-red-500">*</span>
        </legend>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div>
            <label htmlFor="schedule-start-time" className="sr-only">
              開始時間
            </label>
            <select
              id="schedule-start-time"
              className={`${fieldClassName} h-10 appearance-auto`}
              value={draft.startTime}
              aria-invalid={Boolean(errors.startTime)}
              onChange={(event) =>
                onChange({ ...draft, startTime: event.currentTarget.value })
              }
            >
              <option value="">開始時間</option>
              {scheduleTimeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-[color:var(--text-3)]">〜</span>
          <div>
            <label htmlFor="schedule-end-time" className="sr-only">
              終了時間
            </label>
            <select
              id="schedule-end-time"
              className={`${fieldClassName} h-10 appearance-auto`}
              value={draft.endTime}
              aria-invalid={Boolean(errors.endTime)}
              onChange={(event) =>
                onChange({ ...draft, endTime: event.currentTarget.value })
              }
            >
              <option value="">終了時間</option>
              {scheduleTimeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.startTime || errors.endTime ? (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.startTime || errors.endTime}
          </p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor="schedule-venue" className="text-sm font-semibold">
          実施場所
          {!isGathering ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
        <select
          id="schedule-venue"
          className={`${fieldClassName} mt-2 h-10 appearance-auto`}
          value={draft.venueId}
          aria-invalid={Boolean(errors.venueId)}
          onChange={(event) =>
            onChange({ ...draft, venueId: event.currentTarget.value })
          }
        >
          <option value="">例：コートA</option>
          {options.venues.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {errors.venueId ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.venueId}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="schedule-gathering-spot"
          className="text-sm font-semibold"
        >
          集合場所
          {isGathering ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
        <select
          id="schedule-gathering-spot"
          className={`${fieldClassName} mt-2 h-10 appearance-auto`}
          value={draft.gatheringSpotId}
          onChange={(event) =>
            onChange({ ...draft, gatheringSpotId: event.currentTarget.value })
          }
        >
          <option value="">
            {isGathering ? "例：集合場所A" : "例：集合場所A（任意）"}
          </option>
          {options.gatheringSpots.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {errors.gatheringSpotId ? (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.gatheringSpotId}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="schedule-event" className="text-sm font-semibold">
          関連競技
          {draft.type === "competition" ? (
            <span className="ml-0.5 text-red-500">*</span>
          ) : null}
        </label>
        <select
          id="schedule-event"
          className={`${fieldClassName} mt-2 h-10 appearance-auto`}
          value={draft.eventId}
          aria-invalid={Boolean(errors.eventId)}
          onChange={(event) =>
            onChange({ ...draft, eventId: event.currentTarget.value })
          }
        >
          <option value="">例：走れ！〇人〇脚！</option>
          {options.events.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {errors.eventId ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.eventId}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="schedule-notes" className="text-sm font-semibold">
          備考
        </label>
        <textarea
          id="schedule-notes"
          className={`${fieldClassName} mt-2 min-h-20 resize-y py-3`}
          value={draft.notes}
          maxLength={300}
          placeholder="補足事項を入力（任意）"
          onChange={(event) =>
            onChange({ ...draft, notes: event.currentTarget.value })
          }
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">投稿方法</legend>
        <div className="mt-2 inline-flex overflow-hidden rounded-lg border border-[color:var(--border-2)]">
          <button
            type="button"
            aria-pressed={draft.notificationEnabled}
            className={cn(
              "inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition",
              draft.notificationEnabled
                ? "bg-[color:var(--brand-button-1)] text-white"
                : "text-[color:var(--text-2)] hover:bg-[color:var(--surface-2)]"
            )}
            onClick={() => onChange({ ...draft, notificationEnabled: true })}
          >
            <BellIcon size={15} aria-hidden="true" />
            通知あり
          </button>
          <button
            type="button"
            aria-pressed={!draft.notificationEnabled}
            className={cn(
              "inline-flex h-10 items-center gap-2 border-l border-[color:var(--border-2)] px-4 text-sm font-medium transition",
              !draft.notificationEnabled
                ? "bg-[color:var(--surface-2)] text-[color:var(--text-1)]"
                : "text-[color:var(--text-3)] hover:bg-[color:var(--surface-2)]"
            )}
            onClick={() => onChange({ ...draft, notificationEnabled: false })}
          >
            <BellOffIcon size={15} aria-hidden="true" />
            通知なし
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-[color:var(--text-3)]">
          「通知あり」で登録すると、参加メンバーにプッシュ通知が送信されます
        </p>
      </fieldset>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={isSubmitting}
          className="h-10 rounded-lg border border-[color:var(--border-2)] px-4 text-sm font-medium transition hover:bg-[color:var(--surface-2)] disabled:opacity-50"
          onClick={onReset}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="h-10 rounded-lg bg-[color:var(--brand-button-1)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-button-2)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSubmitting ? "処理中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
