import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { CompetitionCreatePage } from "./CompetitionCreatePage";

function createApi(
  overrides: Partial<CompetitionEditorApi> = {}
): CompetitionEditorApi {
  return {
    create: vi.fn(),
    get: vi.fn(),
    listVenues: vi.fn().mockResolvedValue([
      { id: 1, name: "運動場" },
      { id: 2, name: "体育館" },
    ]),
    update: vi.fn(),
    ...overrides,
  };
}

async function waitForVenueOptions() {
  await screen.findByRole("checkbox", { name: "運動場" });
}

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe("CompetitionCreatePage", () => {
  it("submits the shared form through the event API contract", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage api={createApi({ create })} />
        <LocationProbe />
      </MemoryRouter>
    );
    await waitForVenueOptions();

    expect(
      screen.getByRole("heading", { name: "イベントを新規作成" })
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.click(screen.getByRole("checkbox", { name: "運動場" }));
    await user.click(screen.getByRole("checkbox", { name: "体育館" }));
    await user.type(screen.getByLabelText("開始時間*"), "09:30");
    await user.type(screen.getByLabelText("終了時間*"), "10:00");

    // 確認ステップでは作成せず、入力内容を読み返せる状態にとどまる
    await user.click(screen.getByRole("button", { name: "確認へ" }));
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByText("大縄跳び")).toBeInTheDocument();
    expect(screen.getByText("運動場、体育館")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "イベントを作成" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        endTime: "10:00",
        name: "大縄跳び",
        rules: null,
        startTime: "09:30",
        venueIds: [1, 2],
      })
    );

    // 完了ステップは同じモーダル内に出て、閉じると作成したイベントの詳細へ移動する
    expect(
      await screen.findByText("イベントを作成しました")
    ).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/events\/new$/);

    // 集合設定はイベント詳細から行うため、このモーダルでは扱わない
    expect(
      screen.queryByRole("heading", { name: "集合設定" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "イベント詳細へ進む" })
    );
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/events\/1$/)
    );
  });

  it("keeps the user on the form step when validation fails", async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage api={createApi({ create })} />
      </MemoryRouter>
    );
    await waitForVenueOptions();

    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.click(screen.getByRole("button", { name: "確認へ" }));

    expect(create).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "イベント名を入力し、実施場所を選択してください。"
    );
    expect(screen.getByLabelText("イベント名*")).toBeInTheDocument();
  });

  it("returns to the form step from the confirmation step", async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage api={createApi({ create })} />
      </MemoryRouter>
    );
    await waitForVenueOptions();

    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.click(screen.getByRole("checkbox", { name: "運動場" }));
    await user.type(screen.getByLabelText("開始時間*"), "09:30");
    await user.type(screen.getByLabelText("終了時間*"), "10:00");
    await user.click(screen.getByRole("button", { name: "確認へ" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(create).not.toHaveBeenCalled();
    expect(screen.getByLabelText("イベント名*")).toHaveValue("大縄跳び");
    expect(screen.getByRole("checkbox", { name: "運動場" })).toBeChecked();
  });

  it("実施場所を上限まで選ぶと残りの実施場所を選べなくする", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage
          api={createApi({
            listVenues: vi.fn().mockResolvedValue(
              Array.from({ length: 21 }, (_, index) => ({
                id: index + 1,
                name: `実施場所${index + 1}`,
              }))
            ),
          })}
        />
      </MemoryRouter>
    );

    await screen.findByRole("checkbox", { name: "実施場所1" });
    for (let index = 1; index <= 20; index += 1) {
      await user.click(
        screen.getByRole("checkbox", { name: `実施場所${index}` })
      );
    }

    expect(screen.getByRole("checkbox", { name: "実施場所21" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "実施場所20" })).toBeEnabled();
    expect(
      screen.getByText("実施場所は20件まで選択できます。")
    ).toBeInTheDocument();
  });

  it("実施場所の一覧を取得できなければフォームを無効化する", async () => {
    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage
          api={createApi({
            listVenues: vi.fn().mockRejectedValue(new Error("failed")),
          })}
        />
      </MemoryRouter>
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "実施場所の一覧を取得できませんでした。"
    );
    expect(screen.getByRole("group", { name: /実施場所/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "確認へ" })).toBeDisabled();
  });
});
