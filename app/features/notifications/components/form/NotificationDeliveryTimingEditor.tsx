import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { ja } from "date-fns/locale/ja";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { textInputStyle } from "~/components/ui/form/styles/control-styles";
import { useCurrentMinute } from "~/hooks/useCurrentMinute";
import { formatNotificationDateTime } from "~/features/notifications/components/notification-display";
import {
  fromNotificationPickerDate,
  toNotificationPickerDate,
} from "./notification-date-picker-adapter";
import type { NotificationDeliveryTiming } from "~/features/notifications/model/notification-draft";
import { getMinimumNotificationSchedule } from "~/features/notifications/model/notification-schedule-time";

const deliveryTimingOptions = [
  { label: "今すぐ配信", value: "now" },
  { label: "予約配信", value: "scheduled" },
] as const;

type NotificationDeliveryTimingEditorProps = {
  timing: NotificationDeliveryTiming;
  scheduledAt?: string;
  error?: string;
  disabled?: boolean;
  onTimingChange: (timing: NotificationDeliveryTiming) => void;
  onScheduledAtChange: (value: string) => void;
};

export function NotificationDeliveryTimingEditor({
  timing,
  scheduledAt,
  error,
  disabled = false,
  onTimingChange,
  onScheduledAtChange,
}: NotificationDeliveryTimingEditorProps) {
  const currentTime = useCurrentMinute();
  const minimumScheduledAt = toNotificationPickerDate(
    getMinimumNotificationSchedule(currentTime ?? new Date())
  )!;
  const selectedDate = toNotificationPickerDate(scheduledAt);

  return (
    <fieldset disabled={disabled}>
      <legend className="text-text-base mb-2 text-sm font-medium">
        配信タイミング <span className="text-tone-danger-text">*</span>
      </legend>
      <SegmentedControl
        ariaLabel="配信タイミング"
        behavior="selection"
        disabled={disabled}
        onValueChange={onTimingChange}
        options={deliveryTimingOptions}
        value={timing}
      />
      <div className="mt-3 min-h-24">
        {timing === "scheduled" ? (
          <label className="block">
            <span className="text-text-muted mb-1.5 block text-xs">
              予約配信日時（日本時間）
            </span>
            <DatePicker
              aria-describedby={
                error ? "notification-scheduled-at-error" : undefined
              }
              aria-invalid={error ? "true" : undefined}
              aria-label="予約配信日時"
              className={textInputStyle()}
              dateFormat="yyyy/MM/dd (eee) HH:mm"
              locale={ja}
              disabled={disabled}
              maxTime={endOfDay(selectedDate ?? minimumScheduledAt)}
              minDate={minimumScheduledAt}
              minTime={
                isSameDay(
                  selectedDate ?? minimumScheduledAt,
                  minimumScheduledAt
                )
                  ? minimumScheduledAt
                  : startOfDay(selectedDate ?? minimumScheduledAt)
              }
              onChange={(date: Date | null) =>
                onScheduledAtChange(fromNotificationPickerDate(date))
              }
              required
              selected={selectedDate}
              showTimeSelect
              timeCaption="時刻"
              timeIntervals={5}
              wrapperClassName="block w-full"
            />
            {error ? (
              <span
                id="notification-scheduled-at-error"
                className="text-tone-danger-text mt-1 block text-xs"
              >
                {error}
              </span>
            ) : null}
          </label>
        ) : (
          <p className="text-text-base text-sm font-medium">
            現在時刻: {formatNotificationDateTime(currentTime ?? undefined)}
            （日本時間）
          </p>
        )}
      </div>
    </fieldset>
  );
}
