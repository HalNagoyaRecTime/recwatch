import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ScheduleSubmitter } from "../application/schedule-submitter";
import { mockScheduleFormOptions } from "../infrastructure/mock-schedule-form-options";
import type { ScheduleDraft } from "../model/schedule-draft";
import { ScheduleEditorPage } from "./ScheduleEditorPage";

const validDraft: ScheduleDraft = {
  type: "competition",
  startTime: "09:00",
  endTime: "10:00",
  venueId: mockScheduleFormOptions.venues[0].id,
  gatheringSpotId: "",
  eventId: mockScheduleFormOptions.events[0].id,
  notes: "",
  notificationEnabled: true,
};

describe("ScheduleEditorPage", () => {
  it("登録に失敗するとエラーを表示して再送信できる", async () => {
    const failingSubmitter: ScheduleSubmitter = {
      async submit() {
        throw new Error("Request failed");
      },
    };
    const user = userEvent.setup();

    render(
      <ScheduleEditorPage
        submitter={failingSubmitter}
        options={mockScheduleFormOptions}
        initialDraft={validDraft}
      />
    );

    const submitButton = screen.getByRole("button", { name: "登録する" });
    await user.click(submitButton);

    expect(
      await screen.findByText(
        "スケジュールを登録できませんでした。時間をおいて再度お試しください。"
      )
    ).toBeInTheDocument();
    await waitFor(() => expect(submitButton).toBeEnabled());
  });
});
