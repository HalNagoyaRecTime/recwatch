import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { CompetitionAssignmentGateway } from "../api/competition-assignment-gateway";
import { CompetitionAssignmentPage } from "./CompetitionAssignmentPage";

function createGateway(): CompetitionAssignmentGateway {
  return {
    load: vi.fn().mockResolvedValue({
      classrooms: [{ id: 1, name: "1年A組" }],
      students: [
        {
          attendanceNumber: 3,
          classroomId: 1,
          id: 2,
          name: "山田 花子",
          studentNumber: "S001",
          userId: 12,
        },
      ],
      events: [
        { id: 4, name: "リレー", startTime: "09:10", venue: "グラウンド" },
      ],
      spots: [{ id: 5, name: "正門前" }],
      gatherings: [],
    }),
    loadMemberUserIds: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue({
      gathering: { eventId: 4, id: 9, spotId: 5, time: "08:50" },
    }),
  };
}

describe("CompetitionAssignmentPage", () => {
  it("一覧の編集操作で指定されたイベントと集合予定を選択する", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.load).mockResolvedValue({
      classrooms: [{ id: 1, name: "1年A組" }],
      students: [],
      events: [
        { id: 4, name: "リレー", startTime: "09:10", venue: "運動場" },
        { id: 6, name: "綱引き", startTime: "11:00", venue: "体育館" },
      ],
      spots: [{ id: 5, name: "正門前" }],
      gatherings: [
        { eventId: 4, id: 9, spotId: 5, time: "08:50" },
        { eventId: 6, id: 10, spotId: 5, time: "10:40" },
      ],
    });

    render(
      <MemoryRouter
        initialEntries={["/events/assignments?eventId=6&gatheringId=10"]}
      >
        <CompetitionAssignmentPage gateway={gateway} />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByLabelText("イベント")).toHaveValue("6")
    );
    expect(screen.getByLabelText("集合予定")).toHaveValue("10");
  });

  it("APIの選択肢を表示し、集合予定とメンバーを登録する", async () => {
    const gateway = createGateway();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CompetitionAssignmentPage gateway={gateway} />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: "参加者設定" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "対象を選択" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "集合情報" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "参加者" })).toBeInTheDocument();
    expect(
      screen.queryByText("イベントごとの集合予定と参加者を設定します")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1年A組" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "リレー" })).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "参加者候補の生徒一覧" })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("集合時間"), {
      target: { value: "08:50" },
    });
    await user.click(screen.getByRole("checkbox", { name: "山田 花子を選択" }));
    expect(screen.getByText("1名選択中")).toBeInTheDocument();
    expect(screen.getByText("開始時刻")).toBeInTheDocument();
    expect(screen.queryByText("割り当て内容")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "設定を保存" }));

    await waitFor(() =>
      expect(gateway.save).toHaveBeenCalledWith({
        eventId: 4,
        gatheringId: null,
        spotId: 5,
        time: "08:50",
        userIds: [12],
      })
    );
    expect(screen.getByText("参加者設定を保存しました。")).toBeInTheDocument();
  });
});
