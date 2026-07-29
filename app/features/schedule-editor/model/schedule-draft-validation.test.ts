import { describe, expect, it } from "vitest";

import type { ScheduleDraft } from "./schedule-draft";
import {
  isScheduleDraftSubmittable,
  validateScheduleDraft,
} from "./schedule-draft-validation";

const eventDraft: ScheduleDraft = {
  eventName: "走れ！〇人〇脚！",
  startTime: "10:15",
  endTime: "10:25",
  venue: "コートA",
  notes: "",
  notificationEnabled: true,
};

describe("schedule draft validation", () => {
  it("イベント・時間・集合場所があれば送信できる", () => {
    expect(isScheduleDraftSubmittable(eventDraft)).toBe(true);
    expect(validateScheduleDraft(eventDraft)).toEqual({});
  });

  it("集合場所がないイベントは送信できない", () => {
    const draft = { ...eventDraft, venue: "" };

    expect(isScheduleDraftSubmittable(draft)).toBe(false);
    expect(validateScheduleDraft(draft)).toMatchObject({
      venue: "集合場所を入力してください",
    });
  });

  it("イベントが選択されていない場合は送信できない", () => {
    const draft = { ...eventDraft, eventName: "" };

    expect(isScheduleDraftSubmittable(draft)).toBe(false);
    expect(validateScheduleDraft(draft)).toMatchObject({
      eventName: "イベント名を入力してください",
    });
  });
});
