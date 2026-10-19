import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router";

import type { ParticipantAssignmentGateway } from "../api/http-participant-assignment-gateway";
import { ParticipantsPage } from "./ParticipantsPage";

afterEach(cleanup);

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">{`${location.pathname}${location.search}`}</output>
  );
}

describe("ParticipantsPage", () => {
  it("APIから取得した割り当てを表示する", async () => {
    const gateway: ParticipantAssignmentGateway = {
      delete: vi.fn(),
      load: vi.fn().mockResolvedValue([
        {
          gatheringId: 30,
          gatheringSpotId: 1,
          gatheringSpotName: "正門前",
          gatheringTime: "08:50",
          eventId: 20,
          eventName: "リレー",
          eventTime: "09:10〜10:10",
          classNames: ["1年A組"],
          memberNames: ["山田 花子"],
        },
      ]),
    };

    render(
      <MemoryRouter>
        <ParticipantsPage gateway={gateway} />
      </MemoryRouter>
    );

    expect(await screen.findByText("リレー")).toBeInTheDocument();
    expect(screen.getByText("山田 花子")).toBeInTheDocument();
    expect(screen.getByText("正門前 / 08:50")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "出場メンバー一覧" })
    ).toBeInTheDocument();
    expect(screen.queryByText("ガチンコ綱引き")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "表示順" })
    ).not.toBeInTheDocument();
  });

  it("出場メンバーをソートし、3点メニューから編集・削除する", async () => {
    const deleteAssignment = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    const assignments = [
      {
        gatheringId: 31,
        gatheringSpotId: 2,
        gatheringSpotName: "体育館入口",
        gatheringTime: "10:40",
        eventId: 21,
        eventName: "綱引き",
        eventTime: "11:00〜12:00",
        classNames: ["2年B組"],
        memberNames: ["佐藤 太郎"],
      },
      {
        gatheringId: 30,
        gatheringSpotId: 1,
        gatheringSpotName: "正門前",
        gatheringTime: "08:50",
        eventId: 20,
        eventName: "リレー",
        eventTime: "09:10〜10:10",
        classNames: ["1年A組"],
        memberNames: ["山田 花子"],
      },
    ];

    render(
      <MemoryRouter initialEntries={["/participants"]}>
        <ParticipantsPage
          gateway={{
            delete: deleteAssignment,
            load: vi.fn().mockResolvedValue(assignments),
          }}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", {
      name: "出場メンバー一覧",
    });
    await user.click(screen.getByRole("button", { name: "イベント" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("リレー");

    await user.click(
      screen.getByRole("button", { name: "リレー 正門前 08:50の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/events/assignments?eventId=20&gatheringId=30"
    );

    await user.click(
      screen.getByRole("button", {
        name: "綱引き 体育館入口 10:40の操作",
      })
    );
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteAssignment).toHaveBeenCalledWith(31));
    expect(confirm).toHaveBeenCalledWith(
      "「綱引き」（体育館入口 / 10:40）の集合予定と参加者設定を削除します。よろしいですか？"
    );
    expect(screen.queryByText("綱引き")).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it("割り当てが無い場合は空状態を表示する", async () => {
    const gateway: ParticipantAssignmentGateway = {
      delete: vi.fn(),
      load: vi.fn().mockResolvedValue([]),
    };

    render(
      <MemoryRouter>
        <ParticipantsPage gateway={gateway} />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("設定済みの出場メンバーはありません。")
    ).toBeInTheDocument();
  });
});
