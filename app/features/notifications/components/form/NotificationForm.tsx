import { CalendarClock, Send } from "lucide-react";

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

type NotificationFormProps = {
  draft: NotificationDraft;
  errors: NotificationDraftErrors;
  audienceOptions: NotificationAudienceOption[];
  isAudienceLoading?: boolean;
  audienceError?: string | null;
  isSubmissionDisabled?: boolean;
  isSubmitting: boolean;
  isAudienceDisabled?: boolean;
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
  event_participants: "競技参加者",
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

export function NotificationForm({
  draft,
  errors,
  audienceOptions,
  isAudienceLoading = false,
  audienceError = null,
  isSubmissionDisabled = false,
  isSubmitting,
  isAudienceDisabled = false,
  submitLabel,
  cancelTo = "/notifications",
  onChange,
  onSubmit,
  onAudienceReload,
}: NotificationFormProps) {
  const deliveryTiming: NotificationDeliveryTiming =
    draft.deliveryTiming ?? "now";
  const canSubmit =
    draft.title.trim().length > 0 &&
    draft.body.trim().length > 0 &&
    (draft.audienceType === "all" || draft.audienceId.length > 0) &&
    (deliveryTiming === "now" || Boolean(draft.scheduledAt));
  const filteredAudienceOptions = audienceOptions.filter(
    (option) => option.type === draft.audienceType
  );
  const requiresAudienceOption = draft.audienceType !== "all";

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

          <div>
            <p className="text-text-base mb-2 text-sm font-medium">
              通知対象 <span className="text-tone-danger-text">*</span>
            </p>
            <Select
              ariaLabel="通知対象"
              disabled={isAudienceDisabled}
              onValueChange={(audienceType) =>
                onChange({ ...draft, audienceType, audienceId: "" })
              }
              options={audienceTypeOptions}
              value={draft.audienceType}
            />
            <p className="text-text-subtle mt-1.5 text-xs">
              全体 / クラス / 集合 / 競技参加者
            </p>
          </div>

          {draft.audienceType !== "all" ? (
            <div>
              <label
                htmlFor="notification-audience-target"
                className="text-text-base mb-2 block text-sm font-medium"
              >
                対象 <span className="text-tone-danger-text">*</span>
              </label>
              <select
                id="notification-audience-target"
                className={`${inputClassName} h-9 appearance-auto`}
                value={draft.audienceId}
                disabled={
                  isAudienceDisabled ||
                  isAudienceLoading ||
                  Boolean(audienceError)
                }
                aria-invalid={Boolean(errors.audienceId)}
                onChange={(event) =>
                  onChange({ ...draft, audienceId: event.currentTarget.value })
                }
              >
                <option value="">対象を選択</option>
                {filteredAudienceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {isAudienceLoading ? (
                <p className="text-text-subtle mt-1.5 text-xs">
                  通知対象を読み込み中...
                </p>
              ) : audienceError ? (
                <div className="mt-1.5 flex items-center gap-3">
                  <p className="text-tone-danger-text text-xs">
                    {audienceError}
                  </p>
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
              ) : filteredAudienceOptions.length === 0 ? (
                <p className="text-text-subtle mt-1.5 text-xs">
                  選択できる対象がありません。
                </p>
              ) : null}
              {errors.audienceId ? (
                <p className="text-tone-danger-text mt-1.5 text-xs">
                  {errors.audienceId}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="text-text-base mb-2 text-sm font-medium">
              配信タイミング <span className="text-tone-danger-text">*</span>
            </p>
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
          </div>
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
            (requiresAudienceOption &&
              (isAudienceLoading || Boolean(audienceError)))
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
