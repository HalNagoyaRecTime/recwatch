import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { CompetitionEditPage } from "./CompetitionEditPage";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderPage(api: CompetitionEditorApi, path = "/events/7/edit") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/events/:competitionId/edit"
          element={
            <>
              <CompetitionEditPage api={api} />
              <LocationProbe />
            </>
          }
        />
        <Route path="/events" element={<LocationProbe />} />
        <Route path="/events/:competitionId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CompetitionEditPage", () => {
  it("既存データを復元し、更新APIへ編集内容を送信する", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const api: CompetitionEditorApi = {
      create: vi.fn(),
      get: vi.fn().mockResolvedValue({
        endTime: "10:00",
        name: "大縄跳び",
        rules: "旧ルール",
        startTime: "09:30",
        venueIds: [1],
      }),
      listVenues: vi.fn().mockResolvedValue([
        { id: 1, name: "運動場" },
        { id: 2, name: "体育館" },
      ]),
      update,
    };
    const user = userEvent.setup();
    renderPage(api);

    expect(await screen.findByLabelText("イベント名*")).toHaveValue("大縄跳び");
    expect(screen.getByLabelText("イベントルール")).toHaveValue("旧ルール");
    expect(
      await screen.findByRole("checkbox", { name: "運動場" })
    ).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "体育館" })).not.toBeChecked();
    expect(screen.getByLabelText("開始時間*")).toHaveValue("09:30");
    expect(screen.getByLabelText("終了時間*")).toHaveValue("10:00");

    await user.clear(screen.getByLabelText("イベント名*"));
    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び決勝");
    await user.click(screen.getByRole("checkbox", { name: "運動場" }));
    await user.click(screen.getByRole("checkbox", { name: "体育館" }));
    await user.click(screen.getByRole("button", { name: "変更を保存する" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(7, {
        endTime: "10:00",
        name: "大縄跳び決勝",
        rules: "旧ルール",
        startTime: "09:30",
        venueIds: [2],
      })
    );
    // 編集はイベント詳細から開くため、保存後は詳細へ戻る
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/events\/7$/)
    );
  });

  it("読み込み失敗を表示してフォームを無効化する", async () => {
    const api: CompetitionEditorApi = {
      create: vi.fn(),
      get: vi.fn().mockRejectedValue(new Error("イベントが見つかりません")),
      listVenues: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    };
    renderPage(api);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "イベントデータの取得に失敗しました。"
    );
    expect(screen.getByLabelText("イベント名*")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "変更を保存する" })
    ).toBeDisabled();
    expect(api.update).not.toHaveBeenCalled();
  });

  it("不正なイベントIDではAPIを呼ばない", async () => {
    const api: CompetitionEditorApi = {
      create: vi.fn(),
      get: vi.fn(),
      listVenues: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    };
    renderPage(api, "/events/not-a-number/edit");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "イベントIDが不正です。"
    );
    expect(api.get).not.toHaveBeenCalled();
  });
});
