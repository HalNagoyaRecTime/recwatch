import { useEffect, useState, type FormEvent } from "react";

import { NotificationForm } from "../components/NotificationForm";
import { NotificationPhonePreview } from "../components/NotificationPhonePreview";
import { NotificationSummary } from "../components/NotificationSummary";
import type { NotificationSubmitter } from "../application/notification-submitter";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "../model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "../model/notification-draft-validation";
import type { NotificationGroup } from "../model/notification-group";

function formatPreviewDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);
}

function formatPreviewTime(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

type NotificationCreatePageProps = {
  submitter: NotificationSubmitter;
  groups: NotificationGroup[];
};

export function NotificationCreatePage({
  submitter,
  groups,
}: NotificationCreatePageProps) {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewDate, setPreviewDate] = useState<Date | null>(null);

  useEffect(() => {
    setPreviewDate(new Date());
  }, []);

  const previewTime = previewDate ? formatPreviewTime(previewDate) : "--:--";
  const previewDateLabel = previewDate
    ? formatPreviewDate(previewDate)
    : "----/--/--";

  function handleChange(nextDraft: NotificationDraft) {
    setDraft(nextDraft);
    setSubmitted(false);
    setErrors((current) => ({
      ...current,
      title: nextDraft.title.trim() ? undefined : current.title,
      body: nextDraft.body.trim() ? undefined : current.body,
      groupId: nextDraft.groupId ? undefined : current.groupId,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateNotificationDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);

    try {
      await submitter.submit(draft);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="grid gap-10 xl:grid-cols-[minmax(420px,1fr)_minmax(480px,1.05fr)]">
        <section className="min-w-0">
          <h1 className="text-xl font-semibold">通知作成</h1>
          <p className="mt-4 text-sm text-[color:var(--text-3)]">
            生徒や関係者に配信するプッシュ通知を作成します
          </p>
          <div className="mt-5 max-w-[560px]">
            <NotificationForm
              draft={draft}
              errors={errors}
              groups={groups}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
          <div
            aria-live="polite"
            className="mt-4 min-h-5 text-sm text-[color:var(--tone-green-text)]"
          >
            {submitted ? "通知内容を確認しました。" : null}
          </div>
        </section>

        <section className="min-w-0 pt-9">
          <NotificationSummary
            draft={draft}
            deliveryTime={previewTime}
            groups={groups}
          />
          <div className="mt-5">
            <NotificationPhonePreview
              title={draft.title}
              body={draft.body}
              time={previewTime}
              date={previewDateLabel}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
