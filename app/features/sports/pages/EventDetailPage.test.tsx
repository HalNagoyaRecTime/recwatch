import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { EventDetailGateway } from "~/features/sports/api/event-detail-gateway";
import type { EventDetail } from "~/features/sports/model/event-detail";
import { EventDetailPage } from "~/features/sports/pages/EventDetailPage";

const relay: EventDetail = {
  id: 12,
  name: "リレー",
  venue: "メインコート",
  startTime: "11:00",
  endTime: "12:30",
  rules: "バトンを使用します。",
  rounds: [
    {
      round: 1,
      gatherings: [
        {
          id: 101,
          time: "10:45",
          spot: { id: 1, name: "出入口①" },
          memberUserIds: [],
          memberCount: 16,
        },
        {
          id: 102,
          time: "10:45",
          spot: { id: 2, name: "出入口②" },
          memberUserIds: [],
          memberCount: 15,
        },
      ],
    },
    {
      round: 2,
      gatherings: [
        {
          id: 103,
          time: "99:59",
          spot: { id: 1, name: "出入口①" },
          memberUserIds: [],
          memberCount: 14,
        },
      ],
    },
  ],
};

function renderPage(path: string, gateway: EventDetailGateway) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          element={<EventDetailPage gateway={gateway} />}
          path="/events/:competitionId"
        >
          <Route element={<p>集合設定モーダル</p>} path="gatherings" />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("EventDetailPage", () => {
  it("URL のイベント ID で読み込み、基本情報と Round ごとの集合を表示する", async () => {
    const load = vi.fn().mockResolvedValue(relay);
    renderPage("/events/12", { load });

    expect(
      screen.getByRole("heading", { name: "イベント詳細", level: 1 })
    ).toBeInTheDocument();
    await waitFor(() => expect(load).toHaveBeenCalledWith(12));
    expect(
      await screen.findByRole("heading", { name: "リレー", level: 2 })
    ).toBeInTheDocument();

    const basicInfo = screen.getByRole("region", { name: "基本情報" });
    expect(within(basicInfo).getByText("メインコート")).toBeInTheDocument();
    expect(within(basicInfo).getByText("11:00")).toBeInTheDocument();
    expect(within(basicInfo).getByText("12:30")).toBeInTheDocument();
    expect(
      within(basicInfo).getByText("バトンを使用します。")
    ).toBeInTheDocument();

    const round1 = screen.getByRole("region", { name: "Round 1" });
    expect(within(round1).getByText("合計 31名")).toBeInTheDocument();
    expect(within(round1).getByText("出入口①")).toBeInTheDocument();
    expect(within(round1).getByText("16名")).toBeInTheDocument();
    expect(within(round1).getByText("15名")).toBeInTheDocument();

    // 集合時刻が未設定の行は "99:59" を出さない
    const round2 = screen.getByRole("region", { name: "Round 2" });
    expect(within(round2).getByText("未設定")).toBeInTheDocument();
    expect(within(round2).queryByText("99:59")).not.toBeInTheDocument();
  });

  it("Round 番号が連番でなくても保存された番号をそのまま表示する", async () => {
    const [round1, round2] = relay.rounds;
    renderPage("/events/12", {
      load: vi.fn().mockResolvedValue({
        ...relay,
        rounds: [round1, { ...round2, round: 3 }],
      }),
    });

    expect(
      await screen.findByRole("region", { name: "Round 3" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Round 3", level: 3 })
    ).toBeInTheDocument();
    // 配列上の位置（2 番目）を番号として出さない
    expect(
      screen.queryByRole("heading", { name: "Round 2", level: 3 })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("編集・集合設定・一覧への導線を持ち、集合設定は子ルートとして開く", async () => {
    renderPage("/events/12", { load: vi.fn().mockResolvedValue(relay) });

    expect(screen.getByRole("link", { name: "一覧へ戻る" })).toHaveAttribute(
      "href",
      "/events"
    );
    expect(screen.getByRole("link", { name: "編集" })).toHaveAttribute(
      "href",
      "/events/12/edit"
    );
    expect(
      screen.getByRole("link", { name: "集合を設定する" })
    ).toHaveAttribute("href", "/events/12/gatherings");
    expect(
      await screen.findByRole("link", { name: "集合を追加" })
    ).toHaveAttribute("href", "/events/12/gatherings");
    expect(screen.queryByText("集合設定モーダル")).not.toBeInTheDocument();
  });

  it("子ルートの URL では詳細の上に集合設定モーダルを出す", async () => {
    renderPage("/events/12/gatherings", {
      load: vi.fn().mockResolvedValue(relay),
    });

    expect(
      await screen.findByRole("heading", { name: "リレー", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("集合設定モーダル")).toBeInTheDocument();
  });

  it("集合が無ければ案内を出す", async () => {
    renderPage("/events/12", {
      load: vi.fn().mockResolvedValue({ ...relay, rules: null, rounds: [] }),
    });

    expect(
      await screen.findByText(
        "集合設定がまだありません。「集合を設定する」から登録してください。"
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "基本情報" })).getByText(
        "未設定"
      )
    ).toBeInTheDocument();
  });

  it("不正なイベント ID では読み込まずエラーを表示する", async () => {
    const load = vi.fn();
    renderPage("/events/not-a-number", { load });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "イベントIDが不正です。"
    );
    expect(load).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("link", { name: "編集" })
    ).not.toBeInTheDocument();
  });

  it("読み込みに失敗したらエラーを表示する", async () => {
    renderPage("/events/12", {
      load: vi.fn().mockRejectedValue(new Error("network")),
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "イベントデータの取得に失敗しました。"
    );
  });
});
