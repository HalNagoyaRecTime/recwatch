import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";

import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import type {
  NotificationDeliveryTiming,
  NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import type { NotificationDraftErrors } from "~/features/notifications/model/notification-draft-validation";

registerLocale("ja", ja);

const currentDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tokyo",
});

const deliveryTimingOptions = [
  { label: "今すぐ配信", value: "now" },
  { label: "予約配信", value: "scheduled" },
] as const;

function getMinimumScheduledAt() {
  const minimum = new Date();
  minimum.setSeconds(0, 0);
  minimum.setMinutes(minimum.getMinutes() + 1);
  return minimum;
}

function toDateTimeLocalValue(date: Date) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );
  return localDate.toISOString().slice(0, 16);
}

type NotificationDeliveryTimingEditorProps = {
  draft: NotificationDraft;
  errors: NotificationDraftErrors;
  isFullEditDisabled?: boolean;
  onChange: (draft: NotificationDraft) => void;
};

export function NotificationDeliveryTimingEditor({
  draft,
  errors,
  isFullEditDisabled = false,
  onChange,
}: NotificationDeliveryTimingEditorProps) {
  const deliveryTiming: NotificationDeliveryTiming =
    draft.deliveryTiming ?? "now";
  const minimumScheduledAt = getMinimumScheduledAt();
  const scheduledDate = draft.scheduledAt ? new Date(draft.scheduledAt) : null;
  const selectedScheduledDate =
    scheduledDate && !Number.isNaN(scheduledDate.getTime())
      ? scheduledDate
      : null;
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(new Date());
    updateCurrentTime();

    const intervalId = window.setInterval(updateCurrentTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <fieldset disabled={isFullEditDisabled}>
      <legend className="text-text-base mb-2 text-sm font-medium">
        配信タイミング <span className="text-tone-danger-text">*</span>
      </legend>
      <SegmentedControl
        ariaLabel="配信タイミング"
        behavior="selection"
        onValueChange={(value) => onChange({ ...draft, deliveryTiming: value })}
        options={deliveryTimingOptions}
        value={deliveryTiming}
      />
      <div className="mt-3 min-h-24">
        {deliveryTiming === "scheduled" ? (
          <label className="block">
            <span className="text-text-muted mb-1.5 block text-xs">
              予約配信日時
            </span>
            <DatePicker
              aria-describedby={
                errors.scheduledAt
                  ? "notification-scheduled-at-error"
                  : undefined
              }
              aria-invalid={errors.scheduledAt ? "true" : undefined}
              aria-label="予約配信日時"
              className={inputClassName}
              dateFormat="yyyy/MM/dd (eee) HH:mm"
              locale="ja"
              maxTime={endOfDay(selectedScheduledDate ?? minimumScheduledAt)}
              minDate={minimumScheduledAt}
              minTime={
                selectedScheduledDate &&
                isSameDay(selectedScheduledDate, minimumScheduledAt)
                  ? minimumScheduledAt
                  : startOfDay(selectedScheduledDate ?? minimumScheduledAt)
              }
              onChange={(date: Date | null) =>
                onChange({
                  ...draft,
                  scheduledAt: date ? toDateTimeLocalValue(date) : "",
                })
              }
              required
              selected={selectedScheduledDate}
              showTimeSelect
              timeCaption="時刻"
              timeIntervals={5}
              wrapperClassName="block w-full"
            />
            {errors.scheduledAt ? (
              <span
                id="notification-scheduled-at-error"
                className="text-tone-danger-text mt-1 block text-xs"
              >
                {errors.scheduledAt}
              </span>
            ) : null}
          </label>
        ) : (
          <div className="space-y-1">
            <p className="text-text-base text-sm font-medium">
              現在時刻:{" "}
              {currentTime
                ? currentDateTimeFormatter.format(currentTime)
                : "--"}
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

const inputClassName =
  "border-border-base bg-surface-base text-text-base placeholder:text-text-subtle focus:border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none transition-colors";
