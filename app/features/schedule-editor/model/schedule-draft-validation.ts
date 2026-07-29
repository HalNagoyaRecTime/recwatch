import type { ScheduleDraft } from "./schedule-draft";

export type ScheduleDraftErrors = Partial<Record<keyof ScheduleDraft, string>>;

export function isScheduleDraftSubmittable(draft: ScheduleDraft): boolean {
  return (
    draft.eventName.trim().length > 0 &&
    draft.startTime.length > 0 &&
    draft.endTime.length > 0 &&
    draft.startTime < draft.endTime &&
    draft.venue.trim().length > 0
  );
}

export function validateScheduleDraft(
  draft: ScheduleDraft
): ScheduleDraftErrors {
  const errors: ScheduleDraftErrors = {};

  if (!draft.startTime) {
    errors.startTime = "開始時間を入力してください";
  }

  if (!draft.endTime) {
    errors.endTime = "終了時間を入力してください";
  }

  if (draft.startTime && draft.endTime && draft.startTime >= draft.endTime) {
    errors.endTime = "終了時間は開始時間より後に設定してください";
  }

  if (!draft.venue.trim()) {
    errors.venue = "集合場所を入力してください";
  }

  if (!draft.eventName.trim()) {
    errors.eventName = "イベント名を入力してください";
  }

  return errors;
}
