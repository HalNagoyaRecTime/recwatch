import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationSubmissionApi } from "~/features/notifications/api/contracts/notification-submission-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import { NotificationAudienceLoadingError } from "~/features/notifications/api/contracts/errors/notification-audience-loading-error";
import { NotificationSubmissionError } from "~/features/notifications/api/contracts/errors/notification-submission-error";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";
import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";

afterEach(cleanup);

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function createAudienceLoader(
  load = vi.fn().mockResolvedValue(mockNotificationAudienceOptions)
): NotificationAudienceApi {
  return { load };
}

function renderPage(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

async function selectAudience(
  user: ReturnType<typeof userEvent.setup>,
  label: string
) {
  await user.click(screen.getByRole("combobox", { name: "通知対象" }));
  await user.click(screen.getByRole("option", { name: label }));
}

describe("NotificationCreatePage", () => {
  it("未実装のモバイルプレビュー形式では未実装と表示する", async () => {
    const user = userEvent.setup();

    renderPage(
      <NotificationCreatePage
        api={{ submit: vi.fn() }}
        audienceApi={createAudienceLoader()}
      />
    );

    expect(screen.getByText("プレビュー")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "通知詳細" }));
    expect(
      screen.getByRole("status", { name: "プレビュー（未実装）" })
    ).toHaveTextContent("未実装");

    await user.click(screen.getByRole("button", { name: "ロック画面" }));
    expect(
      screen.queryByRole("status", { name: "プレビュー（未実装）" })
    ).not.toBeInTheDocument();
  });

  it("API未接続時は送信操作と成功表示を無効にする", async () => {
    const submit = vi.fn();

    renderPage(
      <NotificationCreatePage
        api={{ submit }}
        audienceApi={createAudienceLoader()}
        isSubmissionEnabled={false}
      />
    );

    expect(
      screen.getByText("API接続後に通知を配信できます。")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "通知を配信" })).toBeDisabled();
    expect(
      screen.queryByText("通知を配信予定に登録しました。")
    ).not.toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("送信中の二重登録を防止して成功メッセージを表示する", async () => {
    let resolveSubmission: (() => void) | undefined;
    const submit = vi.fn(
      () =>
        new Promise<{
          notificationId: number;
          scheduleCount: number;
          status: "draft";
        }>((resolve) => {
          resolveSubmission = () =>
            resolve({
              notificationId: 1,
              scheduleCount: 10,
              status: "draft",
            });
        })
    );
    const user = userEvent.setup();

    renderPage(
      <NotificationCreatePage
        api={{ submit }}
        audienceApi={createAudienceLoader()}
      />
    );

    await user.type(screen.getByLabelText("タイトル*"), "お知らせ");
    await user.type(screen.getByLabelText("本文*"), "本文です");
    const button = screen.getByRole("button", { name: "通知を配信" });
    await user.click(button);
    await user.click(button);

    expect(submit).toHaveBeenCalledTimes(1);
    resolveSubmission?.();
    expect(
      await screen.findByText("通知を配信予定に登録しました。")
    ).toBeInTheDocument();
  });

  it("APIエラーに対応したメッセージを表示する", async () => {
    const api: NotificationSubmissionApi = {
      async submit() {
        throw new NotificationSubmissionError("no_active_devices");
      },
    };
    const user = userEvent.setup();

    renderPage(
      <NotificationCreatePage api={api} audienceApi={createAudienceLoader()} />
    );

    await user.type(screen.getByLabelText("タイトル*"), "お知らせ");
    await user.type(screen.getByLabelText("本文*"), "本文です");
    await user.click(screen.getByRole("button", { name: "通知を配信" }));

    expect(
      await screen.findByText("通知対象に有効な端末がありません。")
    ).toBeInTheDocument();
  });

  it("通知対象の取得失敗を表示して再試行する", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(
        new NotificationAudienceLoadingError("authentication_required")
      )
      .mockResolvedValueOnce(mockNotificationAudienceOptions);
    const user = userEvent.setup();

    renderPage(
      <NotificationCreatePage
        api={{ submit: vi.fn() }}
        audienceApi={createAudienceLoader(load)}
      />
    );

    await selectAudience(user, "クラス");
    expect(await screen.findByText("ログインが必要です。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再試行" }));

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByRole("option", { name: "1年A組" })
    ).toBeInTheDocument();
  });

  it("選択した通知対象に候補がない場合は空状態を表示する", async () => {
    const user = userEvent.setup();

    renderPage(
      <NotificationCreatePage
        api={{ submit: vi.fn() }}
        audienceApi={createAudienceLoader(vi.fn().mockResolvedValue([]))}
      />
    );

    await selectAudience(user, "競技参加者");

    expect(
      await screen.findByText("選択できる対象がありません。")
    ).toBeInTheDocument();
  });
});
