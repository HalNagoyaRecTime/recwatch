import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NotificationSubmissionError } from "../application/notification-submission-error";
import type { NotificationSubmitter } from "../application/notification-submitter";
import type { NotificationAudienceLoader } from "../application/notification-audience-loader";
import { NotificationAudienceLoadingError } from "../application/notification-audience-loading-error";
import { mockNotificationAudienceOptions } from "../infrastructure/mock-notification-audience-options";
import { NotificationCreatePage } from "./NotificationCreatePage";

afterEach(cleanup);

function createAudienceLoader(
  load = vi.fn().mockResolvedValue(mockNotificationAudienceOptions)
): NotificationAudienceLoader {
  return { load };
}

describe("NotificationCreatePage", () => {
  it("API未接続時は送信操作と成功表示を無効にする", async () => {
    const submit = vi.fn();

    render(
      <NotificationCreatePage
        submitter={{ submit }}
        audienceLoader={createAudienceLoader()}
        isSubmissionEnabled={false}
      />
    );

    expect(
      screen.getByText("API接続後に通知を配信できます。")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "配信する" })).toBeDisabled();
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

    render(
      <NotificationCreatePage
        submitter={{ submit }}
        audienceLoader={createAudienceLoader()}
      />
    );

    await user.type(screen.getByLabelText("タイトル*"), "お知らせ");
    await user.type(screen.getByLabelText("本文*"), "本文です");
    const button = screen.getByRole("button", { name: "配信する" });
    await user.click(button);
    await user.click(button);

    expect(submit).toHaveBeenCalledTimes(1);
    resolveSubmission?.();
    expect(
      await screen.findByText("通知を配信予定に登録しました。")
    ).toBeInTheDocument();
  });

  it("APIエラーに対応したメッセージを表示する", async () => {
    const submitter: NotificationSubmitter = {
      async submit() {
        throw new NotificationSubmissionError("no_active_devices");
      },
    };
    const user = userEvent.setup();

    render(
      <NotificationCreatePage
        submitter={submitter}
        audienceLoader={createAudienceLoader()}
      />
    );

    await user.type(screen.getByLabelText("タイトル*"), "お知らせ");
    await user.type(screen.getByLabelText("本文*"), "本文です");
    await user.click(screen.getByRole("button", { name: "配信する" }));

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

    render(
      <NotificationCreatePage
        submitter={{ submit: vi.fn() }}
        audienceLoader={createAudienceLoader(load)}
      />
    );

    await user.selectOptions(screen.getByLabelText("通知対象*"), "class_room");
    expect(await screen.findByText("ログインが必要です。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再試行" }));

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByRole("option", { name: "1年A組" })
    ).toBeInTheDocument();
  });

  it("選択した通知対象に候補がない場合は空状態を表示する", async () => {
    const user = userEvent.setup();

    render(
      <NotificationCreatePage
        submitter={{ submit: vi.fn() }}
        audienceLoader={createAudienceLoader(vi.fn().mockResolvedValue([]))}
      />
    );

    await user.selectOptions(
      screen.getByLabelText("通知対象*"),
      "event_participants"
    );

    expect(
      await screen.findByText("選択できる対象がありません。")
    ).toBeInTheDocument();
  });
});
