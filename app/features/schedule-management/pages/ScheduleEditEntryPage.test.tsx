import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import type { ManagedSchedule } from "../model/schedule";
import { ScheduleEditEntryPage } from "./ScheduleEditEntryPage";

const schedule: ManagedSchedule = {
  id: "schedule-1",
  startTime: "09:10",
  endTime: "10:10",
  venueName: "コートA",
  gatheringSpotName: null,
  relatedEventName: "走れ！〇人〇脚！",
  notes: null,
  publication: { mode: "sent" },
  notificationEnabled: true,
};

describe("ScheduleEditEntryPage", () => {
  const gateway: ScheduleManagementGateway = {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(schedule),
    cancelNotification: vi.fn().mockRejectedValue(new Error("Not used")),
  };

  function renderEditPage(
    submitter: ScheduleSubmitter,
    targetSchedule = schedule
  ) {
    render(
      <MemoryRouter initialEntries={[`/schedule/${targetSchedule.id}/edit`]}>
        <Routes>
          <Route
            path="/schedule/:scheduleId/edit"
            element={
              <ScheduleEditEntryPage
                scheduleId={targetSchedule.id}
                gateway={{
                  ...gateway,
                  get: vi.fn().mockResolvedValue(targetSchedule),
                }}
                createSubmitter={() => submitter}
              />
            }
          />
          <Route path="/schedule" element={<ScheduleListDestination />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("取得したスケジュールを編集モードで表示する", async () => {
    renderEditPage({
      submit: vi.fn().mockResolvedValue({ scheduleId: schedule.id }),
    });

    expect(
      await screen.findByRole("button", { name: "変更を保存" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "イベント編集" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("開始時間")).toHaveValue("09:10");
  });

  it("キャンセルすると一覧へ戻る", async () => {
    const user = userEvent.setup();
    renderEditPage({
      submit: vi.fn().mockResolvedValue({ scheduleId: schedule.id }),
    });

    await user.click(await screen.findByRole("button", { name: "キャンセル" }));

    expect(screen.getByText("イベント一覧")).toBeInTheDocument();
  });

  it("更新に成功すると一覧へ戻る", async () => {
    const submit = vi.fn().mockResolvedValue({ scheduleId: schedule.id });
    const user = userEvent.setup();
    renderEditPage({ submit });

    await user.click(await screen.findByRole("button", { name: "変更を保存" }));

    expect(await screen.findByText("イベント一覧")).toBeInTheDocument();
    expect(screen.getByText("イベントを更新しました。")).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("イベント名と開催場所を変更できる", async () => {
    const targetSchedule: ManagedSchedule = {
      ...schedule,
      id: "schedule-003",
      venueName: "コートB",
      gatheringSpotName: null,
      relatedEventName: "ガチンコ綱引き",
    };
    const submit = vi.fn().mockResolvedValue({
      scheduleId: targetSchedule.id,
    });
    const user = userEvent.setup();
    renderEditPage({ submit }, targetSchedule);

    const saveButton = await screen.findByRole("button", {
      name: "変更を保存",
    });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(submit).toHaveBeenCalledTimes(1);
  });
});

function ScheduleListDestination() {
  const location = useLocation();
  const state =
    typeof location.state === "object" && location.state !== null
      ? location.state
      : {};

  return (
    <>
      <p>イベント一覧</p>
      {"feedbackMessage" in state &&
      typeof state.feedbackMessage === "string" ? (
        <p>{state.feedbackMessage}</p>
      ) : null}
    </>
  );
}
