import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  initialScheduleDraft,
  type ScheduleDraft,
} from "../model/schedule-draft";
import { ScheduleNotificationPreview } from "./ScheduleNotificationPreview";

describe("ScheduleNotificationPreview", () => {
  it("選択されたイベント名と集合場所を通知文に表示する", () => {
    const draft: ScheduleDraft = {
      ...initialScheduleDraft,
      startTime: "09:00",
      eventName: "走れ！〇人〇脚！",
      venue: "コートA",
    };

    render(<ScheduleNotificationPreview draft={draft} />);

    expect(
      screen.getByText(
        new RegExp(
          `${draft.eventName}の開始時間が近づいています。${draft.venue}に集合してください。`
        )
      )
    ).toBeInTheDocument();
  });
});
