import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";

import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import { GatheringSettingsStep } from "~/features/event-gatherings/components/GatheringSettingsStep";
import type { EventGatheringSettings } from "~/features/event-gatherings/model/event-gathering-settings";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";

const existingSettings: EventGatheringSettings = {
  eventId: 12,
  rounds: [
    {
      round: 1,
      gatherings: [
        {
          id: 101,
          time: "10:45",
          spot: { id: 1, name: "出入口①" },
          memberCount: 0,
        },
      ],
    },
  ],
};

const settingsWithMembers: EventGatheringSettings = {
  eventId: 12,
  rounds: [
    {
      round: 1,
      gatherings: [
        {
          id: 101,
          time: "10:45",
          spot: { id: 1, name: "出入口①" },
          memberCount: 2,
        },
        {
          id: 102,
          time: "10:55",
          spot: { id: 2, name: "出入口②" },
          memberCount: 0,
        },
      ],
    },
  ],
};

function createSpotGateway(): GatheringSpotGateway {
  return {
    list: vi.fn().mockResolvedValue({
      items: [
        { id: 1, name: "出入口①", createdAt: "", updatedAt: "" },
        { id: 2, name: "出入口②", createdAt: "", updatedAt: "" },
      ],
      total: 2,
      limit: 2,
      offset: 0,
    }),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function createMemberGateway(): GatheringMemberGateway {
  return {
    loadCandidates: vi.fn().mockResolvedValue({
      classrooms: [
        { id: 1, name: "HAL1A" },
        { id: 2, name: "HAL1B" },
      ],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: true,
        },
        {
          id: 11,
          userId: 1002,
          name: "佐藤 花子",
          classroomId: 1,
          attendanceNumber: 2,
          studentNumber: "2026002",
          isLiveActive: true,
        },
        {
          id: 12,
          userId: 1003,
          name: "鈴木 次郎",
          classroomId: 2,
          attendanceNumber: 1,
          studentNumber: "2026003",
          isLiveActive: true,
        },
      ],
    }),
    loadMembers: vi.fn().mockResolvedValue([]),
    saveMembers: vi
      .fn()
      .mockImplementation(async (_gatheringId: number, userIds: number[]) => [
        ...userIds,
      ]),
  };
}

function renderStep({
  settingsGateway,
  memberGateway = createMemberGateway(),
  onSaved = vi.fn(),
}: {
  settingsGateway: EventGatheringSettingsGateway;
  memberGateway?: GatheringMemberGateway;
  onSaved?: (settings: EventGatheringSettings) => void;
}) {
  render(
    <GatheringSettingsStep
      backLabel="戻る"
      eventId={12}
      memberGateway={memberGateway}
      onBack={vi.fn()}
      onSaved={onSaved}
      settingsGateway={settingsGateway}
      spotGateway={createSpotGateway()}
    />
  );
  return { memberGateway, onSaved };
}

describe("GatheringSettingsStep", () => {
  it("既存の集合設定を読み込んで Round ごとに表示する", async () => {
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });

    const round = await screen.findByRole("region", { name: "Round 1" });
    expect(within(round).getByLabelText("集合時間")).toHaveValue("10:45");
    expect(
      within(round).getByRole("combobox", { name: "集合場所" })
    ).toHaveValue("1");
  });

  it("Round と集合を追加して保存すると、既存行は ID 付き・新規行は ID なしで送る", async () => {
    const save = vi.fn().mockResolvedValue({
      eventId: 12,
      rounds: [
        {
          round: 1,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberCount: 3,
            },
          ],
        },
        {
          round: 2,
          gatherings: [
            {
              id: 102,
              time: "11:00",
              spot: { id: 2, name: "出入口②" },
              memberCount: 0,
            },
          ],
        },
      ],
    });
    const { onSaved } = renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "Roundを追加" }));
    const round2 = screen.getByRole("region", { name: "Round 2" });
    await user.type(within(round2).getByLabelText("集合時間"), "11:00");
    await user.selectOptions(
      within(round2).getByRole("combobox", { name: "集合場所" }),
      "出入口②"
    );

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(12, {
        rounds: [
          {
            round: 1,
            gatherings: [{ gatheringId: 101, time: "10:45", spotId: 1 }],
          },
          {
            round: 2,
            gatherings: [{ gatheringId: null, time: "11:00", spotId: 2 }],
          },
        ],
      })
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("Round の最後の 1 件は削除できず、Round ごと削除するとリクエストから外れる", async () => {
    const save = vi.fn().mockResolvedValue({ eventId: 12, rounds: [] });
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    expect(
      screen.queryByRole("button", { name: "この集合を削除" })
    ).not.toBeInTheDocument();

    // 2 件以上あれば個別に削除でき、残り 1 件になるとまた削除ボタンが消える
    await user.click(screen.getByRole("button", { name: "集合場所を追加" }));
    const removeButtons = screen.getAllByRole("button", {
      name: "この集合を削除",
    });
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[1]);
    expect(
      screen.queryByRole("button", { name: "この集合を削除" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() => expect(save).toHaveBeenCalledWith(12, { rounds: [] }));
  });

  it("入力不足があれば保存せず、行ごとにエラーを表示する", async () => {
    const save = vi.fn();
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue({ eventId: 12, rounds: [] }),
        save,
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Roundを追加" })
    );
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "集合時間を入力してください。 集合場所を選択してください。"
    );
  });

  it("参加者付きの集合を削除して 409 になっても入力を保持し、案内を表示する", async () => {
    const save = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(409, "Gathering in use", "GATHERING_IN_USE")
      );
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "Roundを追加" }));
    const round2 = screen.getByRole("region", { name: "Round 2" });
    await user.type(within(round2).getByLabelText("集合時間"), "11:00");
    await user.selectOptions(
      within(round2).getByRole("combobox", { name: "集合場所" }),
      "出入口②"
    );
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者が登録されている集合は削除できません。"
    );
    expect(screen.getByRole("region", { name: "Round 2" })).toBeInTheDocument();
    expect(within(round2).getByLabelText("集合時間")).toHaveValue("11:00");
  });

  it("参加者が登録済みの集合は人数を表示し、その集合と Round は削除できない", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001, 1003]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(settingsWithMembers),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    expect(screen.getByText("2人登録済み")).toBeInTheDocument();
    expect(
      screen.getByText("参加者が登録されているため、この集合は削除できません。")
    ).toBeInTheDocument();
    // 削除ボタンは参加者のいない 2 件目にだけ出る
    expect(
      screen.getAllByRole("button", { name: "この集合を削除" })
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "削除" })).toBeDisabled();

    // 開くまでは参加者を読まず、開いた集合の分だけ読んでチェックを入れる
    expect(memberGateway.loadMembers).not.toHaveBeenCalled();
    await user.click(
      screen.getAllByRole("button", { name: "メンバーを選択" })[0]
    );
    expect(await screen.findByLabelText("山田 太郎を選択")).toBeChecked();
    expect(screen.getByLabelText("佐藤 花子を選択")).not.toBeChecked();
    expect(screen.getByLabelText("鈴木 次郎を選択")).toBeChecked();
    expect(memberGateway.loadMembers).toHaveBeenCalledTimes(1);
    expect(memberGateway.loadMembers).toHaveBeenCalledWith(101);
  });

  it("参加者ピッカーで候補を絞り込んで選択し、保存すると PUT 1 回で送って人数に反映する", async () => {
    const { memberGateway } = renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn().mockResolvedValue(existingSettings),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    expect(memberGateway.loadCandidates).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    await screen.findByLabelText("山田 太郎を選択");
    expect(memberGateway.loadCandidates).toHaveBeenCalledTimes(1);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "クラスで絞り込み" }),
      "HAL1A"
    );
    expect(screen.queryByLabelText("鈴木 次郎を選択")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "表示中の全員を選択" })
    );
    expect(screen.getByText(/選択中 2人/)).toBeInTheDocument();

    await user.click(screen.getByLabelText("佐藤 花子を選択"));
    expect(screen.getByText(/選択中 1人/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001])
    );
    expect(memberGateway.saveMembers).toHaveBeenCalledTimes(1);
    // 保存後はピッカーが閉じ、行の人数が更新される
    expect(screen.queryByLabelText("山田 太郎を選択")).not.toBeInTheDocument();
    expect(screen.getByText("1人登録済み")).toBeInTheDocument();
    expect(
      screen.getByText("参加者が登録されているため、この集合は削除できません。")
    ).toBeInTheDocument();
  });

  it("停止中の学生は登録済みなら外せるが、新しくは追加できない", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      classrooms: [{ id: 1, name: "HAL1A" }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: false,
        },
        {
          id: 11,
          userId: 1002,
          name: "佐藤 花子",
          classroomId: 1,
          attendanceNumber: 2,
          studentNumber: "2026002",
          isLiveActive: false,
        },
      ],
    });
    // 山田だけが停止前から参加者として登録されている
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    // 登録済みの停止中学生は行が残り、チェックを外せる
    expect(await screen.findByLabelText("山田 太郎を選択")).toBeChecked();
    expect(screen.getByText("停止中")).toBeInTheDocument();
    // 未登録の停止中学生は候補に出さない
    expect(screen.queryByLabelText("佐藤 花子を選択")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("山田 太郎を選択"));
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [])
    );
  });

  it("学生でない参加者は選択から落とし、保存すると集合から外れる", async () => {
    const memberGateway = createMemberGateway();
    // user 9001 は学生でないため候補に現れない（管理画面では作れない状態）
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001, 9001]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    expect(await screen.findByLabelText("山田 太郎を選択")).toBeChecked();
    // 行を出せない参加者は人数にも数えない
    expect(screen.getByText(/選択中 1人/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001])
    );
  });

  it("上限を超えて選ぶと不足人数を案内し、保存できない", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      classrooms: [{ id: 1, name: "HAL1A" }],
      students: Array.from({ length: 31 }, (_, index) => ({
        id: 10 + index,
        userId: 1001 + index,
        name: `学生${index + 1}`,
        classroomId: 1,
        attendanceNumber: index + 1,
        studentNumber: `2026${String(index + 1).padStart(3, "0")}`,
        isLiveActive: true,
      })),
    });
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await screen.findByLabelText("学生1を選択");

    await user.click(
      screen.getByRole("button", { name: "表示中の全員を選択" })
    );

    expect(screen.getByText(/選択中 31人 \/ 30人/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "参加者は30人までです。1人減らしてください。"
    );
    expect(screen.getByRole("button", { name: "参加者を保存" })).toBeDisabled();

    // 1 人減らせば保存できる
    await user.click(screen.getByLabelText("学生1を選択"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));
    await waitFor(() => expect(memberGateway.saveMembers).toHaveBeenCalled());
  });

  it("参加者の保存に失敗しても選択を保持し、再試行できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.saveMembers as Mock)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce([1001]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await user.click(await screen.findByLabelText("山田 太郎を選択"));
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者の保存に失敗しました。"
    );
    expect(screen.getByLabelText("山田 太郎を選択")).toBeChecked();
    expect(screen.getByText("0人登録済み")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));
    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledTimes(2)
    );
    expect(screen.getByText("1人登録済み")).toBeInTheDocument();
  });

  it("キャンセルで閉じると選択は保存されず、未保存の新規集合では参加者を選べない", async () => {
    const { memberGateway } = renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await user.click(await screen.findByLabelText("山田 太郎を選択"));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByLabelText("山田 太郎を選択")).not.toBeInTheDocument();
    expect(memberGateway.saveMembers).not.toHaveBeenCalled();
    expect(screen.getByText("0人登録済み")).toBeInTheDocument();

    // 新規行は集合の ID がまだ無いため、参加者の GET / PUT ができない
    await user.click(screen.getByRole("button", { name: "集合場所を追加" }));
    const pickerButtons = screen.getAllByRole("button", {
      name: "メンバーを選択",
    });
    expect(pickerButtons[0]).toBeEnabled();
    expect(pickerButtons[1]).toBeDisabled();
  });
});
