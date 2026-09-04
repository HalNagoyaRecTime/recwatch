import { BellIcon, BellOffIcon } from "lucide-react";
import type { FormEvent } from "react";

import { cn } from "~/lib/cn";

import type { ScheduleDraft } from "../model/schedule-draft";
import type { ScheduleDraftErrors } from "../model/schedule-draft-validation";
import { isScheduleDraftSubmittable } from "../model/schedule-draft-validation";
import { scheduleTimeOptions } from "../model/schedule-time-options";

type ScheduleFormProps = {
  draft: ScheduleDraft;
  errors: ScheduleDraftErrors;
  isSubmitting: boolean;
  submitLabel?: string;
  onChange: (draft: ScheduleDraft) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const fieldClassName =
  "w-full rounded-lg border border-border-strong bg-surface-base px-3.5 text-sm text-text-base outline-none transition placeholder:text-text-subtle focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

export function ScheduleForm({
  draft,
  errors,
  isSubmitting,
  submitLabel = "登録する",
  onChange,
  onReset,
  onSubmit,
}: ScheduleFormProps) {
  const canSubmit = isScheduleDraftSubmittable(draft);

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
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
          <span className="text-text-subtle text-sm">〜</span>
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
        <label htmlFor="schedule-event" className="text-sm font-semibold">
          イベント名<span className="ml-0.5 text-red-500">*</span>
        </label>
        <input
          id="schedule-event"
          className={`${fieldClassName} mt-2 h-10`}
          value={draft.eventName}
          aria-invalid={Boolean(errors.eventName)}
          placeholder="例：走れ！〇人〇脚！"
          onChange={(event) =>
            onChange({ ...draft, eventName: event.currentTarget.value })
          }
        />
        {errors.eventName ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.eventName}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="schedule-venue" className="text-sm font-semibold">
          開催場所<span className="ml-0.5 text-red-500">*</span>
        </label>
        <input
          id="schedule-venue"
          className={`${fieldClassName} mt-2 h-10`}
          value={draft.venue}
          aria-invalid={Boolean(errors.venue)}
          placeholder="例：体育館"
          onChange={(event) =>
            onChange({ ...draft, venue: event.currentTarget.value })
          }
        />
        {errors.venue ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.venue}</p>
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
        <div className="border-border-strong mt-2 inline-flex overflow-hidden rounded-lg border">
          <button
            type="button"
            aria-pressed={draft.notificationEnabled}
            className={cn(
              "inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition",
              draft.notificationEnabled
                ? "bg-button-brand-gradient-start text-text-base-inverse"
                : "text-text-muted hover:bg-surface-hover"
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
              "border-border-strong inline-flex h-10 items-center gap-2 border-l px-4 text-sm font-medium transition",
              !draft.notificationEnabled
                ? "bg-surface-hover text-text-base"
                : "text-text-subtle hover:bg-surface-hover"
            )}
            onClick={() => onChange({ ...draft, notificationEnabled: false })}
          >
            <BellOffIcon size={15} aria-hidden="true" />
            通知なし
          </button>
        </div>
        <p className="text-text-subtle mt-2 text-xs leading-5">
          「通知あり」で登録すると、参加メンバーにプッシュ通知が送信されます
        </p>
      </fieldset>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={isSubmitting}
          className="border-border-strong hover:bg-surface-hover h-10 rounded-lg border px-4 text-sm font-medium transition disabled:opacity-50"
          onClick={onReset}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="bg-button-brand-gradient-start text-text-base-inverse hover:bg-button-brand-gradient-end h-10 rounded-lg px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSubmitting ? "処理中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
