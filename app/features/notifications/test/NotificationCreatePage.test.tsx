import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";

afterEach(cleanup);

describe("NotificationCreatePage", () => {
  it("通知入力とモバイルプレビューを表示する", () => {
    render(
      <MemoryRouter>
        <NotificationCreatePage />
      </MemoryRouter>
    );

    expect(screen.getByText("通知内容")).toBeInTheDocument();
    expect(screen.getByText("モバイルプレビュー")).toBeInTheDocument();
    expect(screen.getByText("タイトル", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("本文", { selector: "p" })).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "通知の重要度" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("通常：通常の通知として配信します。")
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "recwatch" })).toHaveAttribute(
      "src",
      "/recwatch-logo.svg"
    );
    const submitButton = screen.getByRole("button", { name: "通知を作成" });
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector("svg")).not.toBeInTheDocument();
  });

  it("入力内容をプレビューへ反映する", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationCreatePage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("プッシュ通知タイトル*"), "お知らせ");
    await user.type(screen.getByLabelText("プッシュ通知本文*"), "本文です");

    const title = screen.getByText("お知らせ", { selector: "p" });
    expect(title).toHaveClass("truncate");
    expect(screen.getAllByText("本文です").length).toBeGreaterThanOrEqual(2);
    expect(
      screen
        .getAllByText("本文です")
        .some((element) => element.classList.contains("line-clamp-4"))
    ).toBe(true);
  });

  it("通知対象を検索して複数選択できる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationCreatePage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "対象を指定" }));

    expect(
      screen.getByRole("searchbox", { name: "名前・クラス・チームを検索" })
    ).toBeInTheDocument();
    expect(screen.getByText("個人")).toBeInTheDocument();
    expect(screen.getByText("クラス")).toBeInTheDocument();
    expect(screen.getByText("チーム")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "山田 太郎 2年1組" }));
    await user.click(screen.getByRole("button", { name: "2年1組 32人" }));
    await user.click(screen.getByRole("button", { name: "赤チーム 124人" }));

    expect(
      screen.getByRole("button", { name: "山田 太郎を選択から外す" })
    ).toBeInTheDocument();
    expect(screen.getByText("配信対象：156人")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "山田 太郎を選択から外す" })
    );
    expect(
      screen.queryByRole("button", { name: "山田 太郎を選択から外す" })
    ).not.toBeInTheDocument();
  });

  it("通知詳細でタイトルと本文を全文表示する", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationCreatePage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("タイトル*"), "詳細画面のお知らせ");
    await user.type(
      screen.getByLabelText("Markdown説明*"),
      "# 通知詳細\n\n通知詳細で表示される本文です。\n\n**改行もプレビューできます。**"
    );
    await user.click(screen.getByRole("button", { name: "予約配信" }));
    fireEvent.change(screen.getByLabelText("予約配信日時"), {
      target: { value: "2030-11-07T15:35" },
    });
    await user.click(screen.getByRole("button", { name: "通知詳細" }));

    expect(
      screen.getByRole("region", { name: "通知詳細プレビュー" })
    ).toHaveTextContent("詳細画面のお知らせ");
    expect(
      screen.getByRole("region", { name: "通知詳細プレビュー" })
    ).toHaveTextContent("改行もプレビューできます。");
    expect(
      screen.getByRole("region", { name: "通知詳細プレビュー" })
    ).toHaveTextContent("2030/11/07 15:35");
    expect(
      screen.getByText("通知詳細", { selector: "h4" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("status", { name: "プレビュー（未実装）" })
    ).not.toBeInTheDocument();
  });
});
