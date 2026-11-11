import { notificationScheduleStatusLabels } from "~/features/notifications/components/list/notification-display";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale/ja";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { textInputStyle } from "~/components/ui/form/styles/control-styles";
import { SearchField } from "~/components/ui/form/SearchField";
import { Select } from "~/components/ui/form/Select";
import type { NotificationListFilters as Filters } from "~/features/notifications/model/notification-list";

type Props = {
  value: Filters;
  onChange: (value: Filters) => void;
  calendar: boolean;
};
export function NotificationListFilters({ value, onChange, calendar }: Props) {
  const update = <K extends keyof Filters>(key: K, next: Filters[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="contents">
      <div className="min-w-56 flex-1">
        <SearchField
          ariaLabel="通知を検索"
          placeholder="通知ID・件名・本文・作成者・対象を検索"
          value={value.search}
          onValueChange={(next) => update("search", next)}
        />
      </div>
      <Select
        ariaLabel="配信状態"
        value={value.status}
        onValueChange={(next) => update("status", next)}
        options={[
          { value: "all", label: "すべての状態" },
          {
            value: "scheduled",
            label: notificationScheduleStatusLabels.scheduled,
          },
          {
            value: "resolving",
            label: notificationScheduleStatusLabels.resolving,
          },
          { value: "sending", label: notificationScheduleStatusLabels.sending },
          {
            value: "completed",
            label: notificationScheduleStatusLabels.completed,
          },
          { value: "failed", label: notificationScheduleStatusLabels.failed },
          { value: "stopped", label: notificationScheduleStatusLabels.stopped },
        ]}
      />
      {!calendar && (
        <>
          <Select
            ariaLabel="配信予定日"
            value={value.dateMode}
            onValueChange={(next) => update("dateMode", next)}
            options={[
              { value: "all", label: "すべての日付" },
              { value: "today", label: "今日" },
              { value: "date", label: "日付を指定" },
              { value: "range", label: "期間を指定" },
            ]}
          />
          {(value.dateMode === "date" || value.dateMode === "range") && (
            <label className="text-text-muted flex items-center gap-2 text-sm">
              {value.dateMode === "range" ? "開始日" : "配信日"}
              <DatePicker
                aria-label="配信日の開始"
                locale={ja}
                dateFormat="yyyy/MM/dd"
                isClearable
                className={textInputStyle()}
                selected={value.from ? parseISO(value.from) : null}
                maxDate={
                  value.dateMode === "range" && value.to
                    ? parseISO(value.to)
                    : undefined
                }
                onChange={(date: Date | null) =>
                  update("from", date ? format(date, "yyyy-MM-dd") : "")
                }
              />
            </label>
          )}
          {value.dateMode === "range" && (
            <label className="text-text-muted flex items-center gap-2 text-sm">
              終了日
              <DatePicker
                aria-label="配信日の終了"
                locale={ja}
                dateFormat="yyyy/MM/dd"
                isClearable
                className={textInputStyle()}
                selected={value.to ? parseISO(value.to) : null}
                minDate={value.from ? parseISO(value.from) : undefined}
                onChange={(date: Date | null) =>
                  update("to", date ? format(date, "yyyy-MM-dd") : "")
                }
              />
            </label>
          )}
        </>
      )}
    </div>
  );
}
