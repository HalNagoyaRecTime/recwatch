import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  initialScheduleDraft,
  type ScheduleDraft,
} from "../model/schedule-draft";
import { ScheduleNotificationPreview } from "./ScheduleNotificationPreview";

describe("ScheduleNotificationPreview", () => {
  it("イベント名を表示し、venueを集合場所として使用しない", () => {
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
          `${draft.eventName}の開始時間が近づいています。指定された集合場所に集合してください。`
        )
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(draft.venue))).not.toBeInTheDocument();
  });
});
