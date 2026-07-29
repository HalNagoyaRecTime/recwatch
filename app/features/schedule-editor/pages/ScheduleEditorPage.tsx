import { useState, type FormEvent } from "react";

import type { ScheduleSubmitter } from "../application/schedule-submitter";
import { ScheduleForm } from "../components/ScheduleForm";
import { ScheduleNotificationPreview } from "../components/ScheduleNotificationPreview";
import { ScheduleRowPreview } from "../components/ScheduleRowPreview";
import {
  initialScheduleDraft,
  type ScheduleDraft,
} from "../model/schedule-draft";
import {
  validateScheduleDraft,
  type ScheduleDraftErrors,
} from "../model/schedule-draft-validation";

type ScheduleEditorPageProps = {
  submitter: ScheduleSubmitter;
  initialDraft?: ScheduleDraft;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmitted?: () => void;
};

export function ScheduleEditorPage({
  submitter,
  initialDraft = initialScheduleDraft,
  mode = "create",
  onCancel,
  onSubmitted,
}: ScheduleEditorPageProps) {
  const [draft, setDraft] = useState<ScheduleDraft>(initialDraft);
  const [errors, setErrors] = useState<ScheduleDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const isEditMode = mode === "edit";

  function handleChange(nextDraft: ScheduleDraft) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const changedFields = (
        Object.keys(nextDraft) as Array<keyof ScheduleDraft>
      ).filter((field) => draft[field] !== nextDraft[field]);

      for (const field of changedFields) {
        delete nextErrors[field];
      }

      if (
        changedFields.includes("startTime") ||
        changedFields.includes("endTime")
      ) {
        delete nextErrors.startTime;
        delete nextErrors.endTime;
      }

      return nextErrors;
    });
    setDraft(nextDraft);
    setSubmitted(false);
    setSubmissionError(null);
  }

  function handleReset() {
    setDraft(initialDraft);
    setErrors({});
    setSubmitted(false);
    setSubmissionError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateScheduleDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    setSubmissionError(null);

    try {
      await submitter.submit(draft);
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setSubmissionError(
        "イベントを登録できませんでした。時間をおいて再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "イベント編集" : "イベント新規登録"}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-3)]">
          {isEditMode
            ? "変更内容はイベント情報と通知予定に反映されます"
            : "登録内容はイベント情報に反映されます"}
        </p>
      </header>

      <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(380px,0.9fr)_minmax(560px,1.5fr)]">
        <section className="min-w-0">
          <ScheduleForm
            draft={draft}
            errors={errors}
            isSubmitting={isSubmitting}
            submitLabel={isEditMode ? "変更を保存" : "登録する"}
            onChange={handleChange}
            onReset={onCancel ?? handleReset}
            onSubmit={handleSubmit}
          />
          <div
            aria-live="polite"
            className={`mt-4 min-h-5 text-sm ${
              submissionError
                ? "text-red-600"
                : "text-[color:var(--tone-green-text)]"
            }`}
          >
            {submissionError ??
              (submitted
                ? isEditMode
                  ? "イベントを更新しました。"
                  : "イベント内容を確認しました。"
                : null)}
          </div>
        </section>

        <section className="min-w-0">
          <ScheduleRowPreview draft={draft} />
          <div className="mt-5">
            <ScheduleNotificationPreview draft={draft} />
          </div>
        </section>
      </div>
    </div>
  );
}
