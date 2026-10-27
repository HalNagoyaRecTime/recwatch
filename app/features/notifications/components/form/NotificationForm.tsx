import {
  formatNotificationDraftErrors,
  notificationImportanceLabels,
} from "~/features/notifications/components/notification-display";
import { CalendarClock, Send } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { textInputStyle } from "~/components/ui/form/styles/control-styles";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";

import { NotificationAudienceEditor } from "~/features/notifications/components/form/NotificationAudienceEditor";
import { NotificationDeliveryTimingEditor } from "~/features/notifications/components/form/NotificationDeliveryTimingEditor";
import { NotificationMarkdownEditor } from "~/features/notifications/components/form/NotificationMarkdownEditor";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import type {
  NotificationDeliveryTiming,
  NotificationDraft,
  NotificationImportance,
} from "~/features/notifications/model/notification-draft";
import type { NotificationFormErrors } from "~/features/notifications/hooks/notification-form-errors";

type NotificationFormProps = {
  draft: NotificationDraft;
  errors: NotificationFormErrors;
  audienceOptions: NotificationAudienceOption[];
  isAudienceLoading?: boolean;
  audienceError?: string | null;
  configError?: string | null;
  importanceOptions?: NotificationImportance[];
  recipientCount?: number | null;
  recipientCountError?: string | null;
  isRecipientCountLoading?: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  isAudienceDisabled?: boolean;
  isFullEditDisabled?: boolean;
  submitLabel?: string;
  cancelTo?: string;
  onChange: (draft: NotificationDraft) => void;
  onSubmit: () => void | Promise<void>;
  onAudienceReload?: () => void;
};

export function NotificationForm({
  draft,
  errors: rawErrors,
  audienceOptions,
  isAudienceLoading = false,
  audienceError = null,
  configError = null,
  importanceOptions = [],
  recipientCount = null,
  recipientCountError = null,
  isRecipientCountLoading = false,
  canSubmit,
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
  const errors = formatNotificationDraftErrors(rawErrors);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      noValidate
    >
      <LayeredPanel
        header={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-text-base font-semibold">通知内容</h2>
            {isFullEditDisabled ? (
              <span className="bg-surface-base text-text-muted rounded-full px-2.5 py-1 text-xs font-medium">
                通知詳細のみ編集可能
              </span>
            ) : null}
          </div>
        }
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
              className={textInputStyle()}
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
              className={`${textInputStyle()} min-h-24 resize-y py-2`}
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
              className={textInputStyle()}
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
              disabled={isFullEditDisabled}
              onValueChange={(importance) => onChange({ ...draft, importance })}
              options={[
                {
                  value: "low",
                  label: notificationImportanceLabels.low,
                  disabled: !importanceOptions.includes("low"),
                  tone: "info",
                },
                {
                  value: "normal",
                  label: notificationImportanceLabels.normal,
                  disabled: !importanceOptions.includes("normal"),
                  tone: "success",
                },
                {
                  value: "high",
                  label: notificationImportanceLabels.high,
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

          <NotificationAudienceEditor
            audiences={draft.audiences}
            errors={errors}
            audienceOptions={audienceOptions}
            isAudienceDisabled={isFullEditDisabled || isAudienceDisabled}
            isAudienceLoading={isAudienceLoading}
            audienceError={audienceError}
            recipientCount={recipientCount}
            recipientCountError={recipientCountError}
            isRecipientCountLoading={isRecipientCountLoading}
            onAudiencesChange={(audiences) => onChange({ ...draft, audiences })}
            onAudienceReload={onAudienceReload}
          />

          <NotificationDeliveryTimingEditor
            timing={deliveryTiming}
            scheduledAt={draft.scheduledAt}
            error={errors.scheduledAt}
            disabled={isFullEditDisabled}
            onTimingChange={(timing) =>
              onChange({ ...draft, deliveryTiming: timing })
            }
            onScheduledAtChange={(scheduledAt) =>
              onChange({ ...draft, scheduledAt })
            }
          />
        </div>
      </LayeredPanel>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <ButtonLink to={cancelTo} variant="secondary" size="lg">
          キャンセル
        </ButtonLink>
        <Button
          disabled={!canSubmit || isSubmitting}
          icon={deliveryTiming === "now" ? Send : CalendarClock}
          size="lg"
          type="submit"
          variant="primary"
        >
          {isSubmitting ? "確認中..." : (submitLabel ?? "通知を作成")}
        </Button>
      </div>
    </form>
  );
}
