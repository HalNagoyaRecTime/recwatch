import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { UPDATE_CONFLICT_MESSAGE } from "~/lib/update-conflict";

import type { EventGatheringSettingsGateway } from "~/features/events/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/events/api/contracts/gathering-member-gateway";
import { GatheringSettingsStep } from "~/features/events/components/GatheringSettingsStep";
import type { EventGatheringSettings } from "~/features/events/model/event-gathering-settings";
import type { GatheringSpotReader } from "~/features/gathering-spots/public";

const existingSettings: EventGatheringSettings = {
  eventId: 12,
  lockVersion: 3,
  rounds: [
    {
      round: 1,
      startTime: null,
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
  lockVersion: 3,
  rounds: [
    {
      round: 1,
      startTime: null,
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

afterEach(() => {
  vi.unstubAllGlobals();
});

function createSpotReader(): GatheringSpotReader {
  return {
    listAll: vi.fn().mockResolvedValue([
      { id: 1, name: "出入口①" },
      { id: 2, name: "出入口②" },
    ]),
  };
}

function createMemberGateway(): GatheringMemberGateway {
  return {
    loadCandidates: vi.fn().mockResolvedValue({
      teams: [
        { id: 10, name: "青チーム", classCodes: ["HAL1A", "HAL1B"] },
        { id: 20, name: "赤チーム", classCodes: ["HAL2A"] },
      ],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: true,
        },
        {
          id: 11,
          userId: 1002,
          name: "佐藤 花子",
          teamId: 10,
          classroomId: 2,
          attendanceNumber: 2,
          studentNumber: "2026002",
          isLiveActive: true,
        },
        {
          id: 12,
          userId: 1003,
          name: "鈴木 次郎",
          teamId: 20,
          classroomId: 3,
          attendanceNumber: 1,
          studentNumber: "2026003",
          isLiveActive: true,
        },
      ],
      nonStudents: new Map(),
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
  onMembersSaved = vi.fn(),
  onSaved = vi.fn(),
}: {
  settingsGateway: EventGatheringSettingsGateway;
  memberGateway?: GatheringMemberGateway;
  onMembersSaved?: () => void;
  onSaved?: (settings: EventGatheringSettings) => void;
}) {
  render(
    <GatheringSettingsStep
      backLabel="戻る"
      eventId={12}
      memberGateway={memberGateway}
      onBack={vi.fn()}
      onMembersSaved={onMembersSaved}
      onSaved={onSaved}
      settingsGateway={settingsGateway}
      spotReader={createSpotReader()}
    />
  );
  return { memberGateway, onMembersSaved, onSaved };
}

function teamStudents(teamId: number, firstUserId: number, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: firstUserId + index,
    userId: firstUserId + index,
    name: `学生${firstUserId + index}`,
    teamId,
    classroomId: teamId,
    attendanceNumber: index + 1,
    studentNumber: `2026${firstUserId + index}`,
    isLiveActive: true,
  }));
}

describe("GatheringSettingsStep", () => {
  it("開始時刻を変更・解除しても集合を維持して保存する", async () => {
    const save = vi.fn().mockResolvedValue(existingSettings);
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue({
          ...existingSettings,
          rounds: existingSettings.rounds.map((round) => ({
            ...round,
            startTime: "11:00",
          })),
        }),
        save,
      },
    });
    const input = await screen.findByLabelText("ラウンド 1 の開始時刻");
    expect(input).toHaveValue("11:00");
    fireEvent.change(input, { target: { value: "11:10" } });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith(12, {
        lockVersion: 3,
        rounds: [
          {
            round: 1,
            startTime: "11:10",
            gatherings: [{ gatheringId: 101, time: "10:45", spotId: 1 }],
          },
        ],
      })
    );
    fireEvent.change(screen.getByLabelText("ラウンド 1 の開始時刻"), {
      target: { value: "" },
    });
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith(12, {
        lockVersion: 3,
        rounds: [
          {
            round: 1,
            startTime: null,
            gatherings: [{ gatheringId: 101, time: "10:45", spotId: 1 }],
          },
        ],
      })
    );
  });

  it("既存の集合設定を読み込んで Round ごとに表示する", async () => {
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });

    const round = await screen.findByRole("region", { name: "ラウンド 1" });
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
          startTime: null,
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
          startTime: null,
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

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "ラウンドを追加" }));
    const round2 = screen.getByRole("region", { name: "ラウンド 2" });
    await user.type(within(round2).getByLabelText("集合時間"), "11:00");
    await user.selectOptions(
      within(round2).getByRole("combobox", { name: "集合場所" }),
      "出入口②"
    );

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(12, {
        lockVersion: 3,
        rounds: [
          {
            round: 1,
            startTime: null,
            gatherings: [{ gatheringId: 101, time: "10:45", spotId: 1 }],
          },
          {
            round: 2,
            startTime: null,
            gatherings: [{ gatheringId: null, time: "11:00", spotId: 2 }],
          },
        ],
      })
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("保存レスポンスの版で保持する版を更新し、次の保存へ送る", async () => {
    const save = vi
      .fn()
      .mockResolvedValue({ ...existingSettings, lockVersion: 9 });
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][1]).toMatchObject({ lockVersion: 3 });

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1][1]).toMatchObject({ lockVersion: 9 });
  });

  it("競合したら理由を伝えて最新の内容へ置き換え、次の保存は新しい版で送る", async () => {
    const latest: EventGatheringSettings = {
      eventId: 12,
      lockVersion: 4,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [
            {
              id: 101,
              time: "11:11",
              spot: { id: 1, name: "出入口①" },
              memberCount: 0,
            },
          ],
        },
      ],
    };
    const save = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(409, "conflict", "EVENT_UPDATE_CONFLICT")
      )
      .mockResolvedValue(latest);
    renderStep({
      settingsGateway: {
        load: vi
          .fn()
          .mockResolvedValueOnce(existingSettings)
          .mockResolvedValue(latest),
        save,
      },
    });
    const user = userEvent.setup();

    const round = await screen.findByRole("region", { name: "ラウンド 1" });
    const time = within(round).getByLabelText("集合時間");
    fireEvent.change(time, { target: { value: "12:00" } });
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      UPDATE_CONFLICT_MESSAGE
    );
    await waitFor(() =>
      expect(screen.getByLabelText("集合時間")).toHaveValue("11:11")
    );

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1][1]).toMatchObject({ lockVersion: 4 });
  });

  it("Round の削除が競合したら参加者を戻してから読み込み、削除予定を捨てる", async () => {
    const settings: EventGatheringSettings = {
      eventId: 12,
      lockVersion: 3,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberCount: 1,
            },
          ],
        },
        {
          round: 2,
          startTime: null,
          gatherings: [
            {
              id: 201,
              time: "11:00",
              spot: { id: 2, name: "出入口②" },
              memberCount: 0,
            },
          ],
        },
      ],
    };
    const load = vi.fn().mockResolvedValue(settings);
    const save = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(409, "conflict", "EVENT_UPDATE_CONFLICT")
      )
      .mockResolvedValue(settings);
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001]);
    (memberGateway.saveMembers as Mock).mockResolvedValue([1001]);
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    const user = userEvent.setup();
    renderStep({ memberGateway, settingsGateway: { load, save } });

    const round1 = await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(within(round1).getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(
      await screen.findByRole("region", { name: "ラウンド 1" })
    ).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      UPDATE_CONFLICT_MESSAGE
    );
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(1, 101, []);
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(2, 101, [1001]);
    expect(load).toHaveBeenCalledTimes(2);
    const saveMembersOrder = (memberGateway.saveMembers as Mock).mock
      .invocationCallOrder[1];
    expect(saveMembersOrder).toBeLessThan(load.mock.invocationCallOrder[1]);

    // 削除予定を捨てたので、次の保存では参加者を解除しない
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(memberGateway.saveMembers).toHaveBeenCalledTimes(2);
  });

  it("Round の最後の 1 件は削除できず、Round ごと削除するとリクエストから外れる", async () => {
    const save = vi.fn().mockResolvedValue({ eventId: 12, rounds: [] });
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
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

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(12, { lockVersion: 3, rounds: [] })
    );
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
      await screen.findByRole("button", { name: "ラウンドを追加" })
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

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "ラウンドを追加" }));
    const round2 = screen.getByRole("region", { name: "ラウンド 2" });
    await user.type(within(round2).getByLabelText("集合時間"), "11:00");
    await user.selectOptions(
      within(round2).getByRole("combobox", { name: "集合場所" }),
      "出入口②"
    );
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者が登録されている集合は削除できません。"
    );
    expect(
      screen.getByRole("region", { name: "ラウンド 2" })
    ).toBeInTheDocument();
    expect(within(round2).getByLabelText("集合時間")).toHaveValue("11:00");
  });

  it("参加者が登録済みの集合は個別削除できず、Round削除を確認できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001, 1003]);
    const confirm = vi.fn().mockReturnValue(true);
    vi.stubGlobal("confirm", confirm);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(settingsWithMembers),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    expect(screen.getByText("2人登録済み")).toBeInTheDocument();
    expect(
      screen.getByText("参加者が登録されているため、この集合は削除できません。")
    ).toBeInTheDocument();
    // 個別削除ボタンは参加者のいない 2 件目にだけ出る
    expect(
      screen.getAllByRole("button", { name: "この集合を削除" })
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "削除" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(confirm).toHaveBeenCalledWith(
      "ラウンド 1を削除します。ラウンド内に登録されている参加者もすべて解除されます。よろしいですか？"
    );
    expect(
      screen.queryByRole("region", { name: "ラウンド 1" })
    ).not.toBeInTheDocument();
  });

  it("Round削除の確認をキャンセルするとRoundと参加者を維持する", async () => {
    const memberGateway = createMemberGateway();
    const save = vi.fn();
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal("confirm", confirm);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(settingsWithMembers),
        save,
      },
    });
    const user = userEvent.setup();

    const round1 = await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(within(round1).getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("region", { name: "ラウンド 1" })
    ).toBeInTheDocument();
    expect(memberGateway.loadMembers).not.toHaveBeenCalled();
    expect(memberGateway.saveMembers).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(12, {
      lockVersion: 3,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [
            { gatheringId: 101, time: "10:45", spotId: 1 },
            { gatheringId: 102, time: "10:55", spotId: 2 },
          ],
        },
      ],
    });
  });

  it("Round削除に失敗したら参加者を戻し、再試行できる", async () => {
    const settingsSave = vi
      .fn()
      .mockRejectedValueOnce(new Error("保存エラー"))
      .mockResolvedValue({ eventId: 12, rounds: [] });
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockImplementation(
      async (gatheringId: number) => (gatheringId === 101 ? [1001, 1003] : [])
    );
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(settingsWithMembers),
        save: settingsSave,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "集合設定の保存に失敗しました。"
    );
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(1, 101, []);
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(
      2,
      101,
      [1001, 1003]
    );
    expect(settingsSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() => expect(settingsSave).toHaveBeenCalledTimes(2));
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(3, 101, []);
    expect(memberGateway.loadMembers).toHaveBeenCalledTimes(4);
  });

  it("Round削除後に別の集合の参加者登録が失敗しても再試行できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockImplementation(
      async (gatheringId: number) => (gatheringId === 101 ? [1001] : [])
    );
    (memberGateway.saveMembers as Mock)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("参加者登録エラー"))
      .mockResolvedValueOnce([1002]);
    const savedSettings: EventGatheringSettings = {
      eventId: 12,
      lockVersion: 3,
      rounds: [
        {
          round: 2,
          startTime: null,
          gatherings: [
            {
              id: 201,
              time: "11:00",
              spot: { id: 2, name: "出入口②" },
              memberCount: 0,
            },
            {
              id: 202,
              time: "11:10",
              spot: { id: 2, name: "出入口②" },
              memberCount: 0,
            },
          ],
        },
      ],
    };
    const settingsSave = vi.fn().mockResolvedValue(savedSettings);
    const confirm = vi.fn().mockReturnValue(true);
    vi.stubGlobal("confirm", confirm);
    const user = userEvent.setup();
    const { onMembersSaved } = renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue({
          eventId: 12,
          rounds: [
            {
              round: 1,
              startTime: null,
              gatherings: [
                {
                  id: 101,
                  time: "10:45",
                  spot: { id: 1, name: "出入口①" },
                  memberCount: 1,
                },
              ],
            },
            {
              round: 2,
              startTime: null,
              gatherings: [
                {
                  id: 201,
                  time: "11:00",
                  spot: { id: 2, name: "出入口②" },
                  memberCount: 0,
                },
              ],
            },
          ],
        }),
        save: settingsSave,
      },
    });

    const round1 = await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(within(round1).getByRole("button", { name: "削除" }));
    const round2 = screen.getByRole("region", { name: "ラウンド 2" });
    await user.click(
      within(round2).getByRole("button", { name: "集合場所を追加" })
    );
    await user.click(
      within(round2).getAllByRole("button", { name: "メンバーを選択" })[1]
    );
    await user.click(await screen.findByLabelText("赤チームを選択"));
    await user.click(screen.getByRole("button", { name: "選択を確定" }));
    const gatheringTimes = within(round2).getAllByLabelText("集合時間");
    await user.type(gatheringTimes[1], "11:10");
    const spots = within(round2).getAllByRole("combobox", {
      name: "集合場所",
    });
    await user.selectOptions(spots[1], "2");

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者の登録に失敗しました。集合設定を保存して再試行してください。"
    );
    expect(memberGateway.loadMembers).toHaveBeenCalledTimes(1);
    expect(memberGateway.loadMembers).toHaveBeenCalledWith(101);
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(1, 101, []);
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(2, 202, [1003]);
    expect(settingsSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() => expect(settingsSave).toHaveBeenCalledTimes(2));
    expect(memberGateway.loadMembers).toHaveBeenCalledTimes(1);
    expect(memberGateway.saveMembers).toHaveBeenCalledTimes(3);
    expect(memberGateway.saveMembers).toHaveBeenLastCalledWith(202, [1003]);
    expect(onMembersSaved).toHaveBeenCalledTimes(1);
  });

  it("参加者解除に失敗したらRound削除を保存せず、エラーを表示する", async () => {
    const settingsSave = vi.fn();
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockImplementation(
      async (gatheringId: number) => (gatheringId === 101 ? [1001] : [])
    );
    (memberGateway.saveMembers as Mock)
      .mockRejectedValueOnce(new Error("参加者解除エラー"))
      .mockResolvedValue([]);
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(settingsWithMembers),
        save: settingsSave,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者の解除に失敗しました。ラウンドは削除されていません。"
    );
    expect(settingsSave).not.toHaveBeenCalled();
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(1, 101, []);
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(2, 101, [1001]);
  });

  it("読み込み後に追加された参加者もRound削除前に解除する", async () => {
    const settingsSave = vi.fn().mockResolvedValue({
      eventId: 12,
      rounds: [],
    });
    const memberGateway = createMemberGateway();
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001]);
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: settingsSave,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() => {
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, []);
      expect(settingsSave).toHaveBeenCalledWith(12, {
        lockVersion: 3,
        rounds: [],
      });
    });
  });

  it("複数クラスで構成されたチームを選択し、全対象者を PUT 1 回で保存する", async () => {
    const { memberGateway } = renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn().mockResolvedValue(existingSettings),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    expect(memberGateway.loadCandidates).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    await screen.findByLabelText("青チームを選択");
    expect(memberGateway.loadCandidates).toHaveBeenCalledTimes(1);

    expect(screen.getByText("青チーム")).toBeInTheDocument();
    expect(screen.getByText("HAL1A、HAL1B")).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "参加するチームを検索" }),
      "HAL1B"
    );
    expect(screen.queryByText("赤チーム")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("青チームを選択"));
    expect(screen.getByText(/選択中 1チーム・2人/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001, 1002])
    );
    expect(memberGateway.saveMembers).toHaveBeenCalledTimes(1);
    // 保存後はピッカーが閉じ、行の人数が更新される
    expect(screen.queryByLabelText("青チームを選択")).not.toBeInTheDocument();
    expect(screen.getByText("2人登録済み")).toBeInTheDocument();
    expect(
      screen.getByText("参加者が登録されているため、この集合は削除できません。")
    ).toBeInTheDocument();
  });

  it("チーム名と所属クラスコードでチームを検索できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [
        { id: 10, name: "青チーム", classCodes: ["HAL1A", "HAL1B"] },
        { id: 20, name: "赤チーム", classCodes: ["HAL2A"] },
      ],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: true,
        },
        {
          id: 11,
          userId: 1002,
          name: "佐藤 花子",
          teamId: 10,
          classroomId: 2,
          attendanceNumber: 2,
          studentNumber: "2026002",
          isLiveActive: true,
        },
        {
          id: 12,
          userId: 1003,
          name: "鈴木 次郎",
          teamId: 20,
          classroomId: 3,
          attendanceNumber: 1,
          studentNumber: "2026003",
          isLiveActive: true,
        },
      ],
      nonStudents: new Map(),
    });
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    const search = screen.getByRole("searchbox", {
      name: "参加するチームを検索",
    });
    for (const keyword of ["青チーム", "hal1b"]) {
      await user.clear(search);
      await user.type(search, keyword);
      expect(screen.getByLabelText("青チームを選択")).toBeInTheDocument();
      expect(screen.queryByLabelText("赤チームを選択")).not.toBeInTheDocument();
    }
  });

  it("停止中の学生は登録済みなら外せるが、新しくは追加できない", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [{ id: 10, name: "青チーム", classCodes: ["HAL1A"] }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: false,
        },
        {
          id: 11,
          userId: 1002,
          name: "佐藤 花子",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 2,
          studentNumber: "2026002",
          isLiveActive: false,
        },
        {
          id: 12,
          userId: 1003,
          name: "鈴木 次郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026003",
          isLiveActive: true,
        },
      ],
      nonStudents: new Map(),
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

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    const table = await screen.findByRole("table", {
      name: "参加対象のチーム一覧",
    });
    const outside = screen.getByRole("region", {
      name: "チーム外の登録済み参加者",
    });
    const checkbox = within(outside).getByLabelText("山田 太郎を選択");
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeEnabled();
    expect(
      within(outside).getByRole("table", {
        name: "チーム外の登録済み参加者一覧",
      })
    ).toBeInTheDocument();
    expect(within(table).queryByText("山田 太郎")).not.toBeInTheDocument();
    expect(screen.queryByText("佐藤 花子")).not.toBeInTheDocument();
    expect(within(table).getByLabelText("青チームを選択")).toBeEnabled();
    expect(screen.getByText(/1チームを表示中/)).toBeInTheDocument();
    expect(screen.getByText(/選択中 0チーム・1人/)).toBeInTheDocument();
    expect(
      screen.queryByText(/氏名を確認できない参加者/)
    ).not.toBeInTheDocument();

    // チーム操作は利用中の学生だけを対象にし、登録済みの停止中学生は維持する
    await user.click(screen.getByLabelText("青チームを選択"));
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText("青チームを選択")).toBeChecked();
    expect(screen.getByText(/選択中 1チーム・2人/)).toBeInTheDocument();
    await user.click(screen.getByLabelText("青チームを選択"));
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText("青チームを選択")).not.toBeChecked();
    expect(screen.getByText(/選択中 0チーム・1人/)).toBeInTheDocument();

    // 候補の絞り込みや検索で、別枠の登録済み参加者を隠さない
    await user.type(
      screen.getByRole("searchbox", { name: "参加するチームを検索" }),
      "青"
    );
    expect(checkbox).toBeVisible();
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001])
    );
  });

  it("停止中の登録済み学生はチェックを外しても別枠に残り、付け直せる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [{ id: 10, name: "青チーム", classCodes: ["HAL1A"] }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: false,
        },
      ],
      nonStudents: new Map(),
    });
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    const outside = await screen.findByRole("region", {
      name: "チーム外の登録済み参加者",
    });
    const checkbox = within(outside).getByLabelText("山田 太郎を選択");
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    // 外した瞬間に行が消えると付け直せなくなるため、開いた時点の登録内容で固定する
    expect(within(outside).getByLabelText("山田 太郎を選択")).toBeEnabled();
    expect(screen.getByText(/選択中 0チーム・0人/)).toBeInTheDocument();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001])
    );
  });

  it("停止中の参加者を全員解除して保存すると 0 人になり、集合を削除できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [{ id: 10, name: "青チーム", classCodes: ["HAL1A"] }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: false,
        },
      ],
      nonStudents: new Map(),
    });
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001]);
    const save = vi.fn().mockResolvedValue({
      ...settingsWithMembers,
      rounds: settingsWithMembers.rounds.map((round) => ({
        ...round,
        gatherings: round.gatherings.filter(
          (gathering) => gathering.id === 102
        ),
      })),
    });
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue({
          ...settingsWithMembers,
          rounds: settingsWithMembers.rounds.map((round) => ({
            ...round,
            gatherings: round.gatherings.map((gathering) => ({
              ...gathering,
              memberCount: gathering.id === 101 ? 1 : 0,
            })),
          })),
        }),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    expect(screen.getByText("1人登録済み")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeEnabled();
    expect(
      screen.getAllByRole("button", { name: "この集合を削除" })
    ).toHaveLength(1);
    await user.click(
      screen.getAllByRole("button", { name: "メンバーを選択" })[0]
    );
    await user.click(await screen.findByLabelText("山田 太郎を選択"));
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [])
    );
    expect(screen.getAllByText("0人登録済み")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "削除" })).toBeEnabled();
    const removeButtons = screen.getAllByRole("button", {
      name: "この集合を削除",
    });
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[0]);
    expect(screen.getByLabelText("集合時間")).toHaveValue("10:55");
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(12, {
        lockVersion: 3,
        rounds: [
          {
            round: 1,
            startTime: null,
            gatherings: [{ gatheringId: 102, time: "10:55", spotId: 2 }],
          },
        ],
      })
    );
  });

  it("候補一覧に行が無い参加者も、保存時にそのまま送り返す", async () => {
    const memberGateway = createMemberGateway();
    // user 9001 は学生でないため候補に現れない。サーバー側では正常なデータのため、
    // 画面に出せないからといって黙って外してはいけない。
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001, 9001]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    expect(await screen.findByLabelText("青チームを選択")).not.toBeChecked();
    // 実際に送る人数を出すため、行が無い参加者も数に含める
    expect(screen.getByText(/選択中 0チーム・2人/)).toBeInTheDocument();
    // 氏名が分からない参加者は操作させず、件数だけ知らせる
    expect(
      screen.getByText(/氏名を確認できない参加者が1人います/)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001, 9001])
    );
  });

  it("学生以外の参加者は表の外に氏名付きで出し、チェックを外して参加者から外せる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [{ id: 10, name: "青チーム", classCodes: ["HAL1A"] }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          teamId: 10,
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: true,
        },
      ],
      nonStudents: new Map([
        [2001, { userId: 2001, name: "田中 先生", isLiveActive: true }],
        [2002, { userId: 2002, name: "高橋 先生", isLiveActive: false }],
      ]),
    });
    (memberGateway.loadMembers as Mock).mockResolvedValue([1001, 2001, 2002]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));

    const table = await screen.findByRole("table", {
      name: "参加対象のチーム一覧",
    });
    const outside = screen.getByRole("region", {
      name: "チーム外の登録済み参加者",
    });
    expect(within(table).queryByText("田中 先生")).not.toBeInTheDocument();
    const checkbox = within(outside).getByLabelText("田中 先生を選択");
    expect(checkbox).toBeChecked();
    // 停止中かどうかは学生の行と同じバッジで示す
    expect(within(outside).getAllByText("停止中")).toHaveLength(1);
    expect(
      within(outside).getByText("高橋 先生").closest("tr")
    ).toHaveTextContent("停止中");
    expect(
      screen.queryByText(/氏名を確認できない参加者/)
    ).not.toBeInTheDocument();

    // チームの解除は別枠の参加者を巻き込まない
    await user.click(screen.getByLabelText("青チームを選択"));
    expect(checkbox).toBeChecked();

    // 外しても開いた時点の登録内容で判定するため、別枠から消えず付け直せる
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [2002])
    );
  });

  it("3チーム・120人を選ぶと、30人を超えてもそのまま120人で保存できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [
        { id: 10, name: "青チーム", classCodes: ["HAL1A"] },
        { id: 11, name: "赤チーム", classCodes: ["HAL1B"] },
        { id: 12, name: "黄チーム", classCodes: ["HAL1C"] },
      ],
      students: [
        ...teamStudents(10, 1001, 40),
        ...teamStudents(11, 2001, 40),
        ...teamStudents(12, 3001, 40),
      ],
      nonStudents: new Map(),
    });
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await user.click(await screen.findByLabelText("青チームを選択"));
    await user.click(screen.getByLabelText("赤チームを選択"));
    await user.click(screen.getByLabelText("黄チームを選択"));

    expect(screen.getByText(/選択中 3チーム・120人$/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "参加者を保存" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));
    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [
        ...Array.from({ length: 40 }, (_, index) => 1001 + index),
        ...Array.from({ length: 40 }, (_, index) => 2001 + index),
        ...Array.from({ length: 40 }, (_, index) => 3001 + index),
      ])
    );
  });

  it("36人のチームを選んだあと、1人だけ外して35人で保存できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.loadCandidates as Mock).mockResolvedValue({
      teams: [{ id: 10, name: "青チーム", classCodes: ["HAL1A"] }],
      students: teamStudents(10, 1001, 36),
      nonStudents: new Map(),
    });
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await user.click(await screen.findByLabelText("青チームを選択"));
    const adjustment = screen.getByRole("region", {
      name: "選択したチームの参加者調整",
    });
    await user.click(
      within(adjustment).getByLabelText("学生1036（20261036）を参加者に含める")
    );

    expect(screen.getByText(/選択中 0チーム・35人$/)).toBeInTheDocument();
    expect(screen.getByLabelText("青チームを選択")).toBePartiallyChecked();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));
    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(
        101,
        Array.from({ length: 35 }, (_, index) => 1001 + index)
      )
    );
  });

  it("参加者の保存に失敗しても選択を保持し、再試行できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.saveMembers as Mock)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce([1001, 1002]);
    renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await user.click(await screen.findByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者の保存に失敗しました。"
    );
    expect(screen.getByLabelText("青チームを選択")).toBeChecked();
    expect(screen.getByText("0人登録済み")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "参加者を保存" }));
    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledTimes(2)
    );
    expect(screen.getByText("2人登録済み")).toBeInTheDocument();
  });

  it("キャンセルで選択を破棄し、新規集合では保存前に参加者を選んで集合保存時に登録する", async () => {
    const save = vi.fn().mockResolvedValue({
      eventId: 12,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberCount: 0,
            },
            {
              id: 102,
              time: "11:00",
              spot: { id: 2, name: "出入口②" },
              memberCount: 1,
            },
          ],
        },
      ],
    });
    const { memberGateway } = renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue(existingSettings),
        save,
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "ラウンド 1" });
    await user.click(screen.getByRole("button", { name: "メンバーを選択" }));
    await user.click(await screen.findByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByLabelText("青チームを選択")).not.toBeInTheDocument();
    expect(memberGateway.saveMembers).not.toHaveBeenCalled();
    expect(screen.getByText("0人登録済み")).toBeInTheDocument();

    // 集合を保存する前の参加者選択は画面内に保持する
    await user.click(screen.getByRole("button", { name: "集合場所を追加" }));
    const pickerButtons = screen.getAllByRole("button", {
      name: "メンバーを選択",
    });
    expect(pickerButtons[0]).toBeEnabled();
    expect(pickerButtons[1]).toBeEnabled();
    const hint = screen.getByText("参加者は集合設定の保存後に登録されます。");
    expect(pickerButtons[1]).toHaveAttribute("aria-describedby", hint.id);

    await user.click(pickerButtons[1]);
    await user.click(await screen.findByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "選択を確定" }));
    expect(screen.getByText("2人選択中")).toBeInTheDocument();
    expect(memberGateway.saveMembers).not.toHaveBeenCalled();

    const gatheringTimes = screen.getAllByLabelText("集合時間");
    await user.type(gatheringTimes[1], "11:00");
    const spots = screen.getAllByRole("combobox", { name: "集合場所" });
    await user.selectOptions(spots[1], "2");
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(12, {
        lockVersion: 3,
        rounds: [
          {
            round: 1,
            startTime: null,
            gatherings: [
              { gatheringId: 101, time: "10:45", spotId: 1 },
              { gatheringId: null, time: "11:00", spotId: 2 },
            ],
          },
        ],
      })
    );
    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(102, [1001, 1002])
    );
    expect(screen.getByText("2人登録済み")).toBeInTheDocument();
  });

  it("集合保存後の参加者登録に失敗したら選択を保持し、集合保存から再試行できる", async () => {
    const memberGateway = createMemberGateway();
    (memberGateway.saveMembers as Mock)
      .mockImplementationOnce(
        async (_gatheringId: number, userIds: number[]) => [...userIds]
      )
      .mockRejectedValueOnce(new Error("通信に失敗しました。"));
    const savedSettings: EventGatheringSettings = {
      eventId: 12,
      lockVersion: 3,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [201, 202].map((id) => ({
            id,
            time: "11:00",
            spot: { id: 2, name: "出入口②" },
            memberCount: 0,
          })),
        },
      ],
    };
    const user = userEvent.setup();
    const { onMembersSaved } = renderStep({
      memberGateway,
      settingsGateway: {
        load: vi.fn().mockResolvedValue({ eventId: 12, rounds: [] }),
        save: vi.fn().mockResolvedValue(savedSettings),
      },
    });

    await user.click(
      await screen.findByRole("button", { name: "ラウンドを追加" })
    );
    await user.click(screen.getByRole("button", { name: "集合場所を追加" }));
    const pickerButtons = screen.getAllByRole("button", {
      name: "メンバーを選択",
    });
    await user.click(pickerButtons[0]);
    await user.click(await screen.findByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "選択を確定" }));
    await user.click(pickerButtons[1]);
    await user.click(await screen.findByLabelText("赤チームを選択"));
    await user.click(screen.getByRole("button", { name: "選択を確定" }));

    const gatheringTimes = screen.getAllByLabelText("集合時間");
    await user.type(gatheringTimes[0], "11:00");
    await user.type(gatheringTimes[1], "11:00");
    const spots = screen.getAllByRole("combobox", { name: "集合場所" });
    await user.selectOptions(spots[0], "2");
    await user.selectOptions(spots[1], "2");
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "参加者の登録に失敗しました。集合設定を保存して再試行してください。"
    );
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(
      1,
      201,
      [1001, 1002]
    );
    expect(memberGateway.saveMembers).toHaveBeenNthCalledWith(2, 202, [1003]);
    expect(onMembersSaved).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1人選択中")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "集合設定を保存" })
    ).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledTimes(3)
    );
    expect(memberGateway.saveMembers).toHaveBeenLastCalledWith(202, [1003]);
    expect(screen.getByText("1人登録済み")).toBeInTheDocument();
  });
});
