import { MarkdownPreview } from "~/components/ui/markdown/MarkdownPreview";
import { CalendarClock, Plus, Send, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { Select } from "~/components/ui/form/Select";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";

import type {
  NotificationAudienceOption,
  NotificationAudienceType,
} from "~/features/notifications/model/notification-audience";
import type {
  NotificationDeliveryTiming,
  NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import type { NotificationDraftErrors } from "~/features/notifications/model/notification-draft-validation";
import type { NotificationImportanceDto } from "~/features/notifications/api/dto/notification-common-dto";

type NotificationFormProps = {
  draft: NotificationDraft;
  errors: NotificationDraftErrors;
  audienceOptions: NotificationAudienceOption[];
  isAudienceLoading?: boolean;
  audienceError?: string | null;
  configError?: string | null;
  importanceOptions?: NotificationImportanceDto[];
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
  event: "競技参加者",
  user: "ユーザー",
};

const audienceTypeOptions = Object.entries(notificationAudienceLabels).map(
  ([value, label]) => ({
    label,
    value: value as NotificationAudienceType,
  })
);

const deliveryTimingOptions = [
  { label: "今すぐ配信", value: "now" },
  { label: "予約配信", value: "scheduled" },
] as const;

const importanceLabels: Record<NotificationImportanceDto, string> = {
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
              タイトル <span className="text-tone-danger-text">*</span>
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
              placeholder="例：競技開始時間の変更"
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

          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              詳細本文 <span className="text-tone-danger-text">*</span>
            </span>
            <textarea
              aria-label="詳細本文*"
              aria-invalid={Boolean(errors.detailBody)}
              className={`${inputClassName} min-h-28 resize-y py-2`}
              maxLength={2000}
              onChange={(event) =>
                onChange({ ...draft, detailBody: event.currentTarget.value })
              }
              value={draft.detailBody}
            />
            {errors.detailBody ? (
              <span className="text-tone-danger-text mt-1 block text-xs">
                {errors.detailBody}
              </span>
            ) : null}
          </label>

          <MarkdownPreview content={draft.detailBody} />

          <fieldset disabled={isFullEditDisabled}>
            <p className="text-text-base mb-2 text-sm font-medium">重要度</p>
            <Select
              ariaLabel="重要度"
              disabled={importanceOptions.length === 0 || isFullEditDisabled}
              onValueChange={(importance) => onChange({ ...draft, importance })}
              options={importanceOptions.map((value) => ({
                value,
                label: importanceLabels[value],
              }))}
              value={draft.importance}
            />
            {configError ? (
              <p className="text-tone-danger-text mt-1.5 text-xs">
                {configError}
              </p>
            ) : null}
          </fieldset>

          <fieldset disabled={isFullEditDisabled}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-text-base text-sm font-medium">
                通知対象 <span className="text-tone-danger-text">*</span>
              </p>
              <Button
                disabled={
                  isAudienceDisabled ||
                  draft.audiences.some((item) => item.type === "all")
                }
                icon={Plus}
                onClick={() =>
                  onChange({
                    ...draft,
                    audiences: [
                      ...draft.audiences,
                      {
                        key: `audience-${Date.now()}`,
                        type: "class_room",
                        targetId: "",
                      },
                    ],
                  })
                }
                size="sm"
                type="button"
                variant="secondary"
              >
                対象を追加
              </Button>
            </div>
            <div className="space-y-3">
              {draft.audiences.map((audience, index) => {
                const filteredAudienceOptions = audienceOptions.filter(
                  (option) => option.type === audience.type
                );
                return (
                  <div
                    key={audience.key}
                    className="border-border-base rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                        <Select
                          ariaLabel={`通知対象 ${index + 1}`}
                          disabled={isAudienceDisabled}
                          onValueChange={(type) =>
                            onChange({
                              ...draft,
                              audiences:
                                type === "all"
                                  ? [{ ...audience, type, targetId: "" }]
                                  : draft.audiences.map((item) =>
                                      item.key === audience.key
                                        ? { ...item, type, targetId: "" }
                                        : item
                                    ),
                            })
                          }
                          options={audienceTypeOptions}
                          value={audience.type}
                        />
                        {audience.type !== "all" ? (
                          <select
                            aria-label={`対象 ${index + 1}`}
                            className={`${inputClassName} appearance-auto`}
                            value={audience.targetId}
                            disabled={
                              isAudienceDisabled ||
                              isAudienceLoading ||
                              Boolean(audienceError)
                            }
                            onChange={(event) =>
                              onChange({
                                ...draft,
                                audiences: draft.audiences.map((item) =>
                                  item.key === audience.key
                                    ? {
                                        ...item,
                                        targetId: event.currentTarget.value,
                                      }
                                    : item
                                ),
                              })
                            }
                          >
                            <option value="">対象を選択</option>
                            {filteredAudienceOptions.map((option) => (
                              <option
                                key={`${option.type}-${option.id}`}
                                value={option.id}
                              >
                                {option.name}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                      {draft.audiences.length > 1 ? (
                        <Button
                          aria-label={`通知対象 ${index + 1}を削除`}
                          icon={Trash2}
                          iconOnly
                          onClick={() =>
                            onChange({
                              ...draft,
                              audiences: draft.audiences.filter(
                                (item) => item.key !== audience.key
                              ),
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        />
                      ) : null}
                    </div>
                    {errors[`audiences.${index}`] ? (
                      <p className="text-tone-danger-text mt-1.5 text-xs">
                        {errors[`audiences.${index}`]}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
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
            {deliveryTiming === "scheduled" ? (
              <label className="mt-3 block">
                <span className="text-text-muted mb-1.5 block text-xs">
                  予約配信日時
                </span>
                <input
                  aria-describedby={
                    errors.scheduledAt
                      ? "notification-scheduled-at-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.scheduledAt)}
                  aria-label="予約配信日時"
                  className={inputClassName}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      scheduledAt: event.currentTarget.value,
                    })
                  }
                  min={minimumScheduledAt}
                  required
                  type="datetime-local"
                  value={draft.scheduledAt ?? ""}
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
              <p className="text-text-subtle mt-2 text-xs">
                作成後、対象ユーザーへすぐにプッシュ通知を送信します。
              </p>
            )}
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

  const localMinimum = new Date(
    minimum.getTime() - minimum.getTimezoneOffset() * 60_000
  );
  return localMinimum.toISOString().slice(0, 16);
}
