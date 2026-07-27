import { describe, expect, it } from "vitest";

import type { ScheduleDraft } from "./schedule-draft";
import {
  isScheduleDraftSubmittable,
  validateScheduleDraft,
} from "./schedule-draft-validation";

const gatheringDraft: ScheduleDraft = {
  type: "gathering",
  startTime: "10:15",
  endTime: "10:25",
  venueId: "",
  gatheringSpotId: "spot-1",
  eventId: "",
  notes: "",
  notificationEnabled: true,
};

describe("schedule draft validation", () => {
  it("集合は集合場所があれば実施場所なしで送信できる", () => {
    expect(isScheduleDraftSubmittable(gatheringDraft)).toBe(true);
    expect(validateScheduleDraft(gatheringDraft)).toEqual({});
  });

  it("集合場所がない集合は送信できない", () => {
    const draft = { ...gatheringDraft, gatheringSpotId: "" };

    expect(isScheduleDraftSubmittable(draft)).toBe(false);
    expect(validateScheduleDraft(draft)).toMatchObject({
      gatheringSpotId: "集合場所を選択してください",
    });
  });
});
