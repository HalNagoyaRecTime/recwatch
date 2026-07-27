import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";
import { mockScheduleFormOptions } from "~/features/schedule-editor/infrastructure/mock-schedule-form-options";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import type { ManagedSchedule } from "../model/schedule";
import { ScheduleEditEntryPage } from "./ScheduleEditEntryPage";

const schedule: ManagedSchedule = {
  id: "schedule-1",
  type: "competition",
  startTime: "09:10",
  endTime: "10:10",
  venueName: mockScheduleFormOptions.venues[0].name,
  gatheringSpotName: mockScheduleFormOptions.gatheringSpots[0].name,
  relatedEventName: mockScheduleFormOptions.events[0].name,
  notes: null,
  publication: { mode: "immediate" },
  notificationEnabled: true,
};

describe("ScheduleEditEntryPage", () => {
  const gateway: ScheduleManagementGateway = {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(schedule),
    delete: vi.fn().mockResolvedValue(undefined),
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
                submitter={submitter}
                options={mockScheduleFormOptions}
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
      await screen.findByRole("heading", { name: "スケジュール編集" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "変更を保存" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("開始時間")).toHaveValue("09:10");
  });

  it("キャンセルすると一覧へ戻る", async () => {
    const user = userEvent.setup();
    renderEditPage({
      submit: vi.fn().mockResolvedValue({ scheduleId: schedule.id }),
    });

    await user.click(await screen.findByRole("button", { name: "キャンセル" }));

    expect(screen.getByText("スケジュール一覧")).toBeInTheDocument();
  });

  it("更新に成功すると一覧へ戻る", async () => {
    const submit = vi.fn().mockResolvedValue({ scheduleId: schedule.id });
    const user = userEvent.setup();
    renderEditPage({ submit });

    await user.click(await screen.findByRole("button", { name: "変更を保存" }));

    expect(await screen.findByText("スケジュール一覧")).toBeInTheDocument();
    expect(
      screen.getByText("スケジュールを更新しました。")
    ).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("集合は実施場所がなくても集合場所があれば更新できる", async () => {
    const gatheringSchedule: ManagedSchedule = {
      ...schedule,
      id: "schedule-003",
      type: "gathering",
      venueName: null,
      gatheringSpotName: mockScheduleFormOptions.gatheringSpots[0].name,
      relatedEventName: null,
    };
    const submit = vi.fn().mockResolvedValue({
      scheduleId: gatheringSchedule.id,
    });
    const user = userEvent.setup();
    renderEditPage({ submit }, gatheringSchedule);

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
      <p>スケジュール一覧</p>
      {"feedbackMessage" in state &&
      typeof state.feedbackMessage === "string" ? (
        <p>{state.feedbackMessage}</p>
      ) : null}
    </>
  );
}
