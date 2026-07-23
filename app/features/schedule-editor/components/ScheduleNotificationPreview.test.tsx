import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockScheduleFormOptions } from "../infrastructure/mock-schedule-form-options";
import {
  initialScheduleDraft,
  type ScheduleDraft,
} from "../model/schedule-draft";
import { ScheduleNotificationPreview } from "./ScheduleNotificationPreview";

describe("ScheduleNotificationPreview", () => {
  it("競技以外では選択された種別名を通知文に表示する", () => {
    const draft: ScheduleDraft = {
      ...initialScheduleDraft,
      type: "opening",
      startTime: "09:00",
      eventId: "",
    };

    render(
      <ScheduleNotificationPreview
        draft={draft}
        options={mockScheduleFormOptions}
      />
    );

    expect(
      screen.getByText(/開会式の開始時間が近づいています/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/競技の開始時間が近づいています/)
    ).not.toBeInTheDocument();
  });
});
