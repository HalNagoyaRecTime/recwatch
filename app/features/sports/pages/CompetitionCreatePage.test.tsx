import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { CompetitionCreatePage } from "./CompetitionCreatePage";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe("CompetitionCreatePage", () => {
  it("submits the shared form through the event API contract", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage
          api={{ create, get: vi.fn(), update: vi.fn() }}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "イベントを新規作成" })
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.type(screen.getByLabelText("実施場所*"), "運動場");
    await user.type(screen.getByLabelText("開始時間*"), "09:30");
    await user.type(screen.getByLabelText("終了時間*"), "10:00");

    // 確認ステップでは作成せず、入力内容を読み返せる状態にとどまる
    await user.click(screen.getByRole("button", { name: "確認へ" }));
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByText("大縄跳び")).toBeInTheDocument();
    expect(screen.getByText("運動場")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "イベントを作成" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        endTime: "10:00",
        name: "大縄跳び",
        rules: null,
        startTime: "09:30",
        venue: "運動場",
      })
    );

    // 完了ステップは同じモーダル内に出て、閉じるまで一覧へは戻らない
    expect(
      await screen.findByText("イベントを作成しました")
    ).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/events\/new$/);

    await user.click(screen.getByRole("button", { name: "一覧へ戻る" }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/events$/)
    );
  });

  it("keeps the user on the form step when validation fails", async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage
          api={{ create, get: vi.fn(), update: vi.fn() }}
        />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.click(screen.getByRole("button", { name: "確認へ" }));

    expect(create).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "イベント名および実施場所を入力してください。"
    );
    expect(screen.getByLabelText("イベント名*")).toBeInTheDocument();
  });

  it("returns to the form step from the confirmation step", async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage
          api={{ create, get: vi.fn(), update: vi.fn() }}
        />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.type(screen.getByLabelText("実施場所*"), "運動場");
    await user.type(screen.getByLabelText("開始時間*"), "09:30");
    await user.type(screen.getByLabelText("終了時間*"), "10:00");
    await user.click(screen.getByRole("button", { name: "確認へ" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(create).not.toHaveBeenCalled();
    expect(screen.getByLabelText("イベント名*")).toHaveValue("大縄跳び");
  });
});
