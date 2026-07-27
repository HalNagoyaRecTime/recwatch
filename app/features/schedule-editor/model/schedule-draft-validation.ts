import type { ScheduleDraft } from "./schedule-draft";

export type ScheduleDraftErrors = Partial<Record<keyof ScheduleDraft, string>>;

export function isScheduleDraftSubmittable(draft: ScheduleDraft): boolean {
  const hasRequiredLocation =
    draft.type === "gathering"
      ? draft.gatheringSpotId.length > 0
      : draft.venueId.length > 0;

  return (
    draft.type !== null &&
    draft.startTime.length > 0 &&
    draft.endTime.length > 0 &&
    draft.startTime < draft.endTime &&
    hasRequiredLocation &&
    (draft.type !== "competition" || draft.eventId.length > 0)
  );
}

export function validateScheduleDraft(
  draft: ScheduleDraft
): ScheduleDraftErrors {
  const errors: ScheduleDraftErrors = {};

  if (!draft.type) {
    errors.type = "種別を選択してください";
  }

  if (!draft.startTime) {
    errors.startTime = "開始時間を入力してください";
  }

  if (!draft.endTime) {
    errors.endTime = "終了時間を入力してください";
  }

  if (draft.startTime && draft.endTime && draft.startTime >= draft.endTime) {
    errors.endTime = "終了時間は開始時間より後に設定してください";
  }

  if (draft.type !== "gathering" && !draft.venueId) {
    errors.venueId = "実施場所を選択してください";
  }

  if (draft.type === "gathering" && !draft.gatheringSpotId) {
    errors.gatheringSpotId = "集合場所を選択してください";
  }

  if (draft.type === "competition" && !draft.eventId) {
    errors.eventId = "関連競技を選択してください";
  }

  return errors;
}
