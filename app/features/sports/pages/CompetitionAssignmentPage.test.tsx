import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
    expect(screen.getByRole("button", { name: "完了" })).toBeInTheDocument();
  });

  it("保存中から完了へ切り替え、完了ボタンで入力内容を初期化する", async () => {
    const gateway = createGateway();
    let resolveSave!: (value: {
      gathering: { eventId: number; id: number; spotId: number; time: string };
    }) => void;
    vi.mocked(gateway.save).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        })
    );

    render(
      <MemoryRouter>
        <CompetitionAssignmentPage gateway={gateway} />
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByLabelText("集合時間"), {
      target: { value: "08:50" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "山田 花子を選択" }));
    fireEvent.click(screen.getByRole("button", { name: "設定を保存" }));

    expect(screen.getByRole("button", { name: "保存中..." })).toBeDisabled();

    await act(async () => {
      resolveSave({
        gathering: { eventId: 4, id: 9, spotId: 5, time: "08:50" },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "完了" }));

    expect(screen.getByLabelText("クラス")).toHaveValue("1");
    expect(screen.getByLabelText("イベント")).toHaveValue("4");
    expect(screen.getByLabelText("集合予定")).toHaveValue("new");
    expect(screen.getByLabelText("集合場所")).toHaveValue("5");
    expect(screen.getByLabelText("集合時間")).toHaveValue("");
    expect(
      screen.getByRole("checkbox", { name: "山田 花子を選択" })
    ).not.toBeChecked();
    expect(screen.getByText("0名選択中")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "設定を保存" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("参加者設定を保存しました。")
    ).not.toBeInTheDocument();
  });

  it("完了表示を5秒後に通常表示へ戻す", async () => {
    const gateway = createGateway();

    render(
      <MemoryRouter>
        <CompetitionAssignmentPage gateway={gateway} />
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByLabelText("集合時間"), {
      target: { value: "08:50" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "山田 花子を選択" }));

    vi.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "設定を保存" }));
      });

      expect(screen.getByRole("button", { name: "完了" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(screen.getByRole("button", { name: "完了" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(
        screen.getByRole("button", { name: "設定を保存" })
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  describe("saveAssignment のバリデーション（未入力項目ごと）", () => {
    it("集合時間だけ未入力の場合、集合時間のみのエラーを表示する", async () => {
      const gateway = createGateway();
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CompetitionAssignmentPage gateway={gateway} />
        </MemoryRouter>
      );
      await screen.findByRole("heading", { name: "参加者設定" });
      await user.click(
        screen.getByRole("checkbox", { name: "山田 花子を選択" })
      );

      await user.click(screen.getByRole("button", { name: "設定を保存" }));
      expect(
        screen.getByText("集合時間を選択してください。")
      ).toBeInTheDocument();
      expect(gateway.save).not.toHaveBeenCalled();
    });

    it("参加者だけ未入力の場合、参加者のみのエラーを表示する", async () => {
      const gateway = createGateway();
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CompetitionAssignmentPage gateway={gateway} />
        </MemoryRouter>
      );
      await screen.findByRole("heading", { name: "参加者設定" });
      fireEvent.change(screen.getByLabelText("集合時間"), {
        target: { value: "08:50" },
      });

      await user.click(screen.getByRole("button", { name: "設定を保存" }));
      expect(
        screen.getByText("参加者を選択してください。")
      ).toBeInTheDocument();
      expect(gateway.save).not.toHaveBeenCalled();
    });

    it("イベントだけ未入力の場合、イベントのみのエラーを表示する", async () => {
      const gateway = createGateway();
      vi.mocked(gateway.load).mockResolvedValue({
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
        events: [],
        spots: [{ id: 5, name: "正門前" }],
        gatherings: [],
      });
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CompetitionAssignmentPage gateway={gateway} />
        </MemoryRouter>
      );
      await screen.findByRole("heading", { name: "参加者設定" });
      fireEvent.change(screen.getByLabelText("集合時間"), {
        target: { value: "08:50" },
      });
      await user.click(
        screen.getByRole("checkbox", { name: "山田 花子を選択" })
      );

      await user.click(screen.getByRole("button", { name: "設定を保存" }));
      expect(
        screen.getByText("イベントを選択してください。")
      ).toBeInTheDocument();
      expect(gateway.save).not.toHaveBeenCalled();
    });

    it("集合場所だけ未入力の場合、集合場所のみのエラーを表示する", async () => {
      const gateway = createGateway();
      vi.mocked(gateway.load).mockResolvedValue({
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
        spots: [],
        gatherings: [],
      });
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CompetitionAssignmentPage gateway={gateway} />
        </MemoryRouter>
      );
      await screen.findByRole("heading", { name: "参加者設定" });
      fireEvent.change(screen.getByLabelText("集合時間"), {
        target: { value: "08:50" },
      });
      await user.click(
        screen.getByRole("checkbox", { name: "山田 花子を選択" })
      );
      // 集合場所は選択肢が無いため未入力のまま保存する
      await user.click(screen.getByRole("button", { name: "設定を保存" }));
      expect(
        screen.getByText("集合場所を選択してください。")
      ).toBeInTheDocument();
      expect(gateway.save).not.toHaveBeenCalled();
    });
  });
});
