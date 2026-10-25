import { NotificationMarkdownEditor } from "~/features/notifications/components/form/NotificationMarkdownEditor";
import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { CalendarClock, Send, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import {
  SearchCombobox,
  type SearchOption,
} from "~/components/ui/form/SearchCombobox";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";

import type {
  NotificationAudienceOption,
  NotificationAudienceType,
} from "~/features/notifications/model/notification-audience";
import type {
  NotificationAudienceDraftItem,
  NotificationDeliveryTiming,
  NotificationDraft,
  NotificationImportance,
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

type NotificationFormProps = {
  draft: NotificationDraft;
  errors: NotificationDraftErrors;
  audienceOptions: NotificationAudienceOption[];
  isAudienceLoading?: boolean;
  audienceError?: string | null;
  configError?: string | null;
  importanceOptions?: NotificationImportance[];
  recipientCount?: number | null;
  recipientCountError?: string | null;
  isRecipientCountLoading?: boolean;
  isSubmissionDisabled?: boolean;
  isSubmitting: boolean;
  isAudienceDisabled?: boolean;
  isFullEditDisabled?: boolean;
  submitLabel?: string;
  cancelTo?: string;
  onChange: (draft: NotificationDraft) => void;
  onSubmit: () => void | Promise<void>;
  onAudienceReload?: () => void;
};

const notificationAudienceLabels: Record<NotificationAudienceType, string> = {
  all: "全体",
  class_room: "クラス",
  gathering: "集合",
  event: "イベント",
  user: "ユーザー",
};

const userCategoryLabels = {
  student: "生徒",
  teacher: "先生",
  student_and_teacher: "生徒・先生",
} as const;

type SelectableNotificationAudienceType = Exclude<
  NotificationAudienceType,
  "all"
>;

const audienceSearchLimit = 30;
const audienceSelectionOptions: {
  label: string;
  value: NotificationAudienceType;
}[] = [
  { label: "全員", value: "all" },
  { label: "ユーザー", value: "user" },
  { label: "クラス", value: "class_room" },
  { label: "集合", value: "gathering" },
  { label: "イベント", value: "event" },
];

const deliveryTimingOptions = [
  { label: "今すぐ配信", value: "now" },
  { label: "予約配信", value: "scheduled" },
] as const;

const importanceLabels: Record<NotificationImportance, string> = {
  low: "低",
  normal: "通常",
  high: "高",
};

export function NotificationForm({
  draft,
  errors,
  audienceOptions,
  isAudienceLoading = false,
  audienceError = null,
  configError = null,
  importanceOptions = [],
  recipientCount = null,
  recipientCountError = null,
  isRecipientCountLoading = false,
  isSubmissionDisabled = false,
  isSubmitting,
  isAudienceDisabled = false,
  isFullEditDisabled = false,
  submitLabel,
  cancelTo = "/notifications",
  onChange,
  onSubmit,
  onAudienceReload,
}: NotificationFormProps) {
  const deliveryTiming: NotificationDeliveryTiming =
    draft.deliveryTiming ?? "now";
  const canSubmit =
    draft.detailTitle.trim().length > 0 &&
    draft.detailBody.trim().length > 0 &&
    (isFullEditDisabled ||
      (draft.title.trim().length > 0 &&
        draft.body.trim().length > 0 &&
        draft.audiences.length > 0 &&
        draft.audiences.every(
          (item) => item.type === "all" || item.targetId.length > 0
        ) &&
        (deliveryTiming === "now" || Boolean(draft.scheduledAt))));
  const requiresAudienceOption = draft.audiences.some(
    (item) => item.type !== "all"
  );
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
  const [audienceQuery, setAudienceQuery] = useState("");
  const selectedAudiences = draft.audiences.filter(
    (
      audience
    ): audience is NotificationAudienceDraftItem & {
      type: SelectableNotificationAudienceType;
    } => audience.type !== "all"
  );
  const [audienceScope, setAudienceScope] =
    useState<SelectableNotificationAudienceType>(
      () => selectedAudiences[0]?.type ?? "user"
    );
  const selectedAudienceKeys = new Set(
    selectedAudiences.map((audience) => `${audience.type}:${audience.targetId}`)
  );
  const normalizedAudienceQuery = audienceQuery
    .trim()
    .toLocaleLowerCase("ja-JP");
  const audienceSearchOptions: SearchOption[] = normalizedAudienceQuery
    ? audienceOptions
        .filter(
          (option) =>
            option.type === audienceScope &&
            !selectedAudienceKeys.has(`${option.type}:${option.id}`) &&
            `${option.name} ${option.id}`
              .toLocaleLowerCase("ja-JP")
              .includes(normalizedAudienceQuery)
        )
        .slice(0, audienceSearchLimit)
        .map((option) => ({
          id: `${option.type}:${option.id}`,
          label: option.name,
          badge: notificationAudienceLabels[option.type],
          ...(option.type === "user" && option.userCategory
            ? { badge: userCategoryLabels[option.userCategory] }
            : {}),
          description: `ID: ${option.id}`,
        }))
    : [];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      noValidate
    >
      <LayeredPanel
        header={<h2 className="text-text-base font-semibold">通知内容</h2>}
      >
        <div className="space-y-5">
          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              プッシュタイトル <span className="text-tone-danger-text">*</span>
            </span>
            <input
              aria-label="タイトル*"
              aria-describedby={
                errors.title ? "notification-title-error" : undefined
              }
              aria-invalid={Boolean(errors.title)}
              className={inputClassName}
              disabled={isFullEditDisabled}
              maxLength={50}
              onChange={(event) =>
                onChange({ ...draft, title: event.currentTarget.value })
              }
              placeholder="例：イベント時間の変更"
              required
              value={draft.title}
            />
            <span className="text-text-subtle mt-1.5 block text-right text-xs">
              {draft.title.length} / 50
            </span>
            {errors.title ? (
              <span
                id="notification-title-error"
                className="text-tone-danger-text mt-1 block text-xs"
              >
                {errors.title}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              本文 <span className="text-tone-danger-text">*</span>
            </span>
            <textarea
              aria-label="本文*"
              aria-describedby={
                errors.body ? "notification-body-error" : undefined
              }
              aria-invalid={Boolean(errors.body)}
              className={`${inputClassName} min-h-24 resize-y py-2`}
              disabled={isFullEditDisabled}
              maxLength={200}
              onChange={(event) =>
                onChange({ ...draft, body: event.currentTarget.value })
              }
              placeholder="通知本文を入力してください"
              required
              value={draft.body}
            />
            <span className="text-text-subtle mt-1.5 block text-right text-xs">
              {draft.body.length} / 200
            </span>
            {errors.body ? (
              <span
                id="notification-body-error"
                className="text-tone-danger-text mt-1 block text-xs"
              >
                {errors.body}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              詳細タイトル <span className="text-tone-danger-text">*</span>
            </span>
            <input
              aria-label="詳細タイトル*"
              aria-invalid={Boolean(errors.detailTitle)}
              className={inputClassName}
              maxLength={100}
              onChange={(event) =>
                onChange({ ...draft, detailTitle: event.currentTarget.value })
              }
              value={draft.detailTitle}
            />
            {errors.detailTitle ? (
              <span className="text-tone-danger-text mt-1 block text-xs">
                {errors.detailTitle}
              </span>
            ) : null}
          </label>

          <NotificationMarkdownEditor
            value={draft.detailBody}
            error={errors.detailBody}
            onChange={(detailBody) => onChange({ ...draft, detailBody })}
          />

          <fieldset disabled={isFullEditDisabled}>
            <p className="text-text-base mb-2 text-sm font-medium">重要度</p>
            <SegmentedControl
              ariaLabel="重要度"
              behavior="selection"
              onValueChange={(importance) => onChange({ ...draft, importance })}
              options={[
                {
                  value: "low",
                  label: importanceLabels.low,
                  disabled: !importanceOptions.includes("low"),
                  tone: "info",
                },
                {
                  value: "normal",
                  label: importanceLabels.normal,
                  disabled: !importanceOptions.includes("normal"),
                  tone: "success",
                },
                {
                  value: "high",
                  label: importanceLabels.high,
                  disabled: !importanceOptions.includes("high"),
                  tone: "danger",
                },
              ]}
              value={draft.importance}
            />
            {configError ? (
              <p className="text-tone-danger-text mt-1.5 text-xs">
                {configError}
              </p>
            ) : null}
            {errors.importance ? (
              <p className="text-tone-danger-text mt-1.5 text-xs">
                {errors.importance}
              </p>
            ) : null}
          </fieldset>

          <fieldset disabled={isFullEditDisabled || isAudienceDisabled}>
            <div className="mb-3 space-y-2">
              <p className="text-text-base text-sm font-medium">
                通知対象 <span className="text-tone-danger-text">*</span>
              </p>
              <SegmentedControl
                ariaLabel="通知対象"
                behavior="selection"
                onValueChange={(type) => {
                  setAudienceQuery("");
                  if (type === "all") {
                    onChange({
                      ...draft,
                      audiences: [
                        { key: "audience-all", type: "all", targetId: "" },
                      ],
                    });
                    return;
                  }

                  setAudienceScope(type);
                  onChange({
                    ...draft,
                    audiences: draft.audiences.some(
                      (item) => item.type === "all"
                    )
                      ? []
                      : selectedAudiences,
                  });
                }}
                options={audienceSelectionOptions}
                value={
                  draft.audiences.some((item) => item.type === "all")
                    ? "all"
                    : audienceScope
                }
              />
            </div>
            {!draft.audiences.some((item) => item.type === "all") ? (
              <div className="space-y-3">
                <SearchCombobox
                  ariaLabel={`${notificationAudienceLabels[audienceScope]}を検索して追加`}

                  disabled={
                    isAudienceDisabled ||
                    isAudienceLoading ||
                    Boolean(audienceError)
                  }
                  emptyMessage={
                    normalizedAudienceQuery
                      ? "一致する通知対象がありません"
                      : "名前またはIDを入力して検索できます"
                  }
                  onOptionSelect={(selectedOption) => {
                    const option = audienceOptions.find(
                      (item) => `${item.type}:${item.id}` === selectedOption.id
                    );
                    if (!option) return;

                    onChange({
                      ...draft,
                      audiences: [
                        ...selectedAudiences,
                        {
                          key: `audience-${option.type}-${option.id}`,
                          type: option.type,
                          targetId: option.id,
                        },
                      ],
                    });
                    setAudienceQuery("");
                  }}
                  onQueryChange={setAudienceQuery}
                  options={audienceSearchOptions}
                  placeholder={`${notificationAudienceLabels[audienceScope]}を名前・IDで検索して追加`}
                  query={audienceQuery}
                />
                {selectedAudiences.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAudiences.map((audience, index) => {
                      const option = audienceOptions.find(
                        (item) =>
                          item.type === audience.type &&
                          item.id === audience.targetId
                      );
                      const label = notificationAudienceLabels[audience.type];
                      const userCategory =
                        audience.type === "user"
                          ? option?.userCategory
                          : undefined;

                      return (
                        <div
                          key={audience.key}
                          className="border-border-base flex items-center gap-3 rounded-md border px-3 py-2.5"
                        >
                          <span className="bg-surface-muted text-text-muted app-rounded shrink-0 px-2 py-1 text-xs font-medium">
                            {userCategory
                              ? userCategoryLabels[userCategory]
                              : label}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-text-base block truncate text-sm font-medium">
                              {option?.name ?? `${label} #${audience.targetId}`}
                            </span>
                            <span className="text-text-subtle block text-xs">
                              ID: {audience.targetId}
                            </span>
                          </span>
                          <Button
                            aria-label={`${label} ${option?.name ?? audience.targetId}を削除`}
                            icon={Trash2}
                            iconOnly
                            onClick={() =>
                              onChange({
                                ...draft,
                                audiences: selectedAudiences.filter(
                                  (item) => item.key !== audience.key
                                ),
                              })
                            }
                            size="sm"
                            type="button"
                            variant="ghost"
                          />
                          {errors[`audiences.${index}`] ? (
                            <span className="text-tone-danger-text text-xs">
                              {errors[`audiences.${index}`]}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-text-subtle text-xs">
                    上の検索欄から通知対象を追加してください。
                  </p>
                )}
              </div>
            ) : null}
            {errors.audiences ? (
              <p className="text-tone-danger-text mt-1.5 text-xs">
                {errors.audiences}
              </p>
            ) : null}
            {isAudienceLoading ? (
              <p className="text-text-subtle mt-1.5 text-xs">
                通知対象を読み込み中...
              </p>
            ) : audienceError ? (
              <div className="mt-1.5 flex items-center gap-3">
                <p className="text-tone-danger-text text-xs">{audienceError}</p>
                {onAudienceReload ? (
                  <button
                    type="button"
                    className="text-brand-primary text-xs font-semibold underline underline-offset-2"
                    onClick={onAudienceReload}
                  >
                    再試行
                  </button>
                ) : null}
              </div>
            ) : null}
            <p className="text-text-subtle mt-2 text-xs" aria-live="polite">
              {isRecipientCountLoading
                ? "対象人数を確認中..."
                : recipientCountError
                  ? `対象人数を取得できませんでした: ${recipientCountError}`
                  : recipientCount === null
                    ? null
                    : `対象候補 ${recipientCount.toLocaleString("ja-JP")}人`}
            </p>
          </fieldset>

          <fieldset disabled={isFullEditDisabled}>
            <legend className="text-text-base mb-2 text-sm font-medium">
              配信タイミング <span className="text-tone-danger-text">*</span>
            </legend>
            <SegmentedControl
              ariaLabel="配信タイミング"
              behavior="selection"
              onValueChange={(value) =>
                onChange({ ...draft, deliveryTiming: value })
              }
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
                    maxTime={endOfDay(
                      selectedScheduledDate ?? minimumScheduledAt
                    )}
                    minDate={minimumScheduledAt}
                    minTime={
                      selectedScheduledDate &&
                      isSameDay(selectedScheduledDate, minimumScheduledAt)
                        ? minimumScheduledAt
                        : startOfDay(
                            selectedScheduledDate ?? minimumScheduledAt
                          )
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
        </div>
      </LayeredPanel>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <ButtonLink to={cancelTo} variant="secondary" size="lg">
          キャンセル
        </ButtonLink>
        <Button
          disabled={
            !canSubmit ||
            isSubmissionDisabled ||
            isSubmitting ||
            (!isFullEditDisabled &&
              (Boolean(configError) ||
                importanceOptions.length === 0 ||
                (requiresAudienceOption &&
                  (isAudienceLoading || Boolean(audienceError)))))
          }
          icon={deliveryTiming === "now" ? Send : CalendarClock}
          size="lg"
          type="submit"
          variant="primary"
        >
          {isSubmitting
            ? "確認中..."
            : (submitLabel ??
              (deliveryTiming === "now" ? "通知を配信" : "配信を予約"))}
        </Button>
      </div>
    </form>
  );
}

const inputClassName =
  "border-border-base bg-surface-base text-text-base placeholder:text-text-subtle focus:border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none transition-colors";

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
