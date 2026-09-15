import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
          memberUserIds: [],
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
        },
        {
          id: 11,
          userId: 1002,
          name: "佐藤 花子",
          classroomId: 1,
          attendanceNumber: 2,
          studentNumber: "2026002",
        },
        {
          id: 12,
          userId: 1003,
          name: "鈴木 次郎",
          classroomId: 2,
          attendanceNumber: 1,
          studentNumber: "2026003",
        },
      ],
    }),
    saveMembers: vi.fn(),
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
              memberUserIds: [],
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
              memberUserIds: [],
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

  it("参加者が登録済みの集合は選択済みで始まり、その集合と Round は削除できない", async () => {
    renderStep({
      settingsGateway: {
        load: vi.fn().mockResolvedValue({
          eventId: 12,
          rounds: [
            {
              round: 1,
              gatherings: [
                {
                  id: 101,
                  time: "10:45",
                  spot: { id: 1, name: "出入口①" },
                  memberUserIds: [1001, 1003],
                  memberCount: 2,
                },
                {
                  id: 102,
                  time: "10:55",
                  spot: { id: 2, name: "出入口②" },
                  memberUserIds: [],
                  memberCount: 0,
                },
              ],
            },
          ],
        }),
        save: vi.fn(),
      },
    });
    const user = userEvent.setup();

    await screen.findByRole("region", { name: "Round 1" });
    expect(screen.getByText("2人選択")).toBeInTheDocument();
    expect(
      screen.getByText("参加者が登録されているため、この集合は削除できません。")
    ).toBeInTheDocument();
    // 削除ボタンは参加者のいない 2 件目にだけ出る
    expect(
      screen.getAllByRole("button", { name: "この集合を削除" })
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "削除" })).toBeDisabled();

    // ピッカーを開くと登録済みの参加者にチェックが入っている
    await user.click(
      screen.getAllByRole("button", { name: "メンバーを選択" })[0]
    );
    expect(await screen.findByLabelText("山田 太郎を選択")).toBeChecked();
    expect(screen.getByLabelText("佐藤 花子を選択")).not.toBeChecked();
    expect(screen.getByLabelText("鈴木 次郎を選択")).toBeChecked();
  });

  it("参加者ピッカーで候補を絞り込んで選択でき、保存 API は呼ばない", async () => {
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

    expect(
      screen.getByText(
        "参加者の保存は現在未対応です。ここでの選択内容は保存されません。"
      )
    ).toBeInTheDocument();
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
    expect(screen.getByText("2人選択")).toBeInTheDocument();

    await user.click(screen.getByLabelText("佐藤 花子を選択"));
    expect(screen.getByText("1人選択")).toBeInTheDocument();

    // ピッカーを閉じても選択状態は行に残る
    await user.click(screen.getByRole("button", { name: "完了" }));
    expect(screen.queryByLabelText("山田 太郎を選択")).not.toBeInTheDocument();
    expect(screen.getByText("1人選択")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() =>
      expect(memberGateway.saveMembers).not.toHaveBeenCalled()
    );
  });
});
