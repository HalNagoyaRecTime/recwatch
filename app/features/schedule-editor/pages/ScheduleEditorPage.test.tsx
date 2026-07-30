import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ScheduleSubmitter } from "../application/schedule-submitter";
import type { ScheduleDraft } from "../model/schedule-draft";
import { ScheduleEditorPage } from "./ScheduleEditorPage";

const validDraft: ScheduleDraft = {
  eventName: "走れ！〇人〇脚！",
  startTime: "09:00",
  endTime: "10:00",
  venue: "コートA",
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
        initialDraft={validDraft}
      />
    );

    const submitButton = screen.getByRole("button", { name: "登録する" });
    await user.click(submitButton);

    expect(
      await screen.findByText(
        "イベントを登録できませんでした。時間をおいて再度お試しください。"
      )
    ).toBeInTheDocument();
    await waitFor(() => expect(submitButton).toBeEnabled());
  });
});
