import type { FormEvent } from "react";

import type {
  NotificationAudienceType,
  NotificationDraft,
} from "../model/notification-draft";
import { notificationAudienceLabels } from "../model/notification-draft";
import type { NotificationDraftErrors } from "../model/notification-draft-validation";
import type { NotificationGroup } from "../model/notification-group";

type NotificationFormProps = {
  draft: NotificationDraft;
  errors: NotificationDraftErrors;
  groups: NotificationGroup[];
  isSubmitting: boolean;
  onChange: (draft: NotificationDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const fieldClassName =
  "w-full rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] px-3.5 text-sm text-[color:var(--text-1)] outline-none transition placeholder:text-[color:var(--text-3)] focus:border-[color:var(--brand-1)] focus:ring-2 focus:ring-[color:var(--surface-brand-soft)]";

export function NotificationForm({
  draft,
  errors,
  groups,
  isSubmitting,
  onChange,
  onSubmit,
}: NotificationFormProps) {
  const canSubmit =
    draft.title.trim().length > 0 &&
    draft.body.trim().length > 0 &&
    (draft.audienceType === "all" || draft.groupId.length > 0);

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="notification-title" className="text-sm font-semibold">
          タイトル<span className="ml-0.5 text-red-500">*</span>
        </label>
        <input
          id="notification-title"
          className={`${fieldClassName} mt-2 h-10`}
          value={draft.title}
          maxLength={80}
          placeholder="タイトルを入力"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={
            errors.title ? "notification-title-error" : undefined
          }
          onChange={(event) =>
            onChange({ ...draft, title: event.currentTarget.value })
          }
        />
        {errors.title ? (
          <p
            id="notification-title-error"
            className="mt-1.5 text-xs text-red-600"
          >
            {errors.title}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="notification-body" className="text-sm font-semibold">
          本文<span className="ml-0.5 text-red-500">*</span>
        </label>
        <textarea
          id="notification-body"
          className={`${fieldClassName} mt-2 min-h-28 resize-y py-3`}
          value={draft.body}
          maxLength={500}
          placeholder="本文を入力"
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "notification-body-error" : undefined}
          onChange={(event) =>
            onChange({ ...draft, body: event.currentTarget.value })
          }
        />
        {errors.body ? (
          <p
            id="notification-body-error"
            className="mt-1.5 text-xs text-red-600"
          >
            {errors.body}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="notification-audience"
          className="text-sm font-semibold"
        >
          通知対象<span className="ml-0.5 text-red-500">*</span>
        </label>
        <select
          id="notification-audience"
          className={`${fieldClassName} mt-2 h-10 appearance-auto`}
          value={draft.audienceType}
          onChange={(event) =>
            onChange({
              ...draft,
              audienceType: event.currentTarget
                .value as NotificationAudienceType,
              groupId:
                event.currentTarget.value === "group" ? draft.groupId : "",
            })
          }
        >
          {Object.entries(notificationAudienceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[color:var(--text-3)]">
          全体 / グループ・チーム
        </p>
      </div>

      {draft.audienceType === "group" ? (
        <div>
          <label htmlFor="notification-group" className="text-sm font-semibold">
            対象グループ<span className="ml-0.5 text-red-500">*</span>
          </label>
          <select
            id="notification-group"
            className={`${fieldClassName} mt-2 h-10 appearance-auto`}
            value={draft.groupId}
            aria-invalid={Boolean(errors.groupId)}
            aria-describedby={
              errors.groupId ? "notification-group-error" : undefined
            }
            onChange={(event) =>
              onChange({ ...draft, groupId: event.currentTarget.value })
            }
          >
            <option value="">グループを選択</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {errors.groupId ? (
            <p
              id="notification-group-error"
              className="mt-1.5 text-xs text-red-600"
            >
              {errors.groupId}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="pt-1">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-lg bg-[color:var(--brand-button-1)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-button-2)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSubmitting ? "確認中..." : "配信する"}
        </button>
      </div>
    </form>
  );
}
