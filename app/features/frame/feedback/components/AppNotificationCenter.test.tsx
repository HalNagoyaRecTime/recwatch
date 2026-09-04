import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFeedback } from "../hooks/useFeedback";
import { FeedbackProvider } from "./FeedbackProvider";
import { AppNotificationCenter } from "./AppNotificationCenter";
import {
  getAppNotificationStorageKey,
  type AppNotification,
} from "../model/app-notification";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  private readonly callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  emit(target: Element, intersectionRatio: number) {
    this.callback(
      [
        {
          target,
          isIntersecting: intersectionRatio > 0,
          intersectionRatio,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  }
}

function SeedNotification() {
  const { report } = useFeedback();
  return (
    <button
      type="button"
      onClick={() =>
        report({
          kind: "action-error",
          title: "更新失敗",
          message: "更新できませんでした",
          diagnostic: {
            route: "/teachers",
            action: "更新",
            endpoint: "/api/teachers/1",
            status: 500,
            errorCode: "SERVER_ERROR",
            requestId: "req-123",
            occurredAt: "発生時刻",
          },
        })
      }
    >
      seed
    </button>
  );
}

function SeedSimpleNotification() {
  const { report } = useFeedback();
  return (
    <button
      type="button"
      onClick={() =>
        report({
          kind: "background-success",
          title: "完了",
          message: "処理が完了しました",
        })
      }
    >
      simple-seed
    </button>
  );
}

function renderCenter() {
  return render(
    <FeedbackProvider userId="test-user">
      <SeedNotification />
      <AppNotificationCenter />
    </FeedbackProvider>
  );
}

describe("AppNotificationCenter", () => {
  beforeEach(() => {
    window.localStorage.clear();
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("空状態を表示する", () => {
    renderCenter();
    expect(screen.getByText("通知はありません")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "通知" }).closest(".scrollbar-none")
    ).not.toBeInTheDocument();
  });

  it("開いただけでは通知を既読にしない", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));

    const row = await screen.findByText("更新失敗", { exact: true });
    expect(screen.getByLabelText("未読")).toBeInTheDocument();
    expect(row).toBeInTheDocument();
  });

  it("表示割合が閾値を超えた状態が続くと既読にする", async () => {
    vi.useFakeTimers();
    renderCenter();
    fireEvent.click(screen.getByRole("button", { name: "seed" }));

    const row = screen.getByText("更新失敗", { exact: true });
    const observer = MockIntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();
    observer?.emit(row.closest("li") as HTMLElement, 0.5);

    await act(async () => {
      vi.advanceTimersByTime(399);
    });
    expect(screen.getByLabelText("未読")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByLabelText("未読")).not.toBeInTheDocument();
  });

  it("表示領域から離れると遅延中の既読化を取り消す", async () => {
    vi.useFakeTimers();
    renderCenter();
    fireEvent.click(screen.getByRole("button", { name: "seed" }));

    const row = screen.getByText("更新失敗", { exact: true });
    const observer = MockIntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();
    const target = row.closest("li") as HTMLElement;
    observer?.emit(target, 0.5);
    observer?.emit(target, 0);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByLabelText("未読")).toBeInTheDocument();
  });

  it("スクロールで新たに表示された通知だけを既読にする", async () => {
    vi.useFakeTimers();
    const notifications: AppNotification[] = [0, 1].map((index) => ({
      id: `notification-${index}`,
      kind: "background-error",
      severity: "error",
      title: `通知${index}`,
      message: "失敗しました",
      createdAt: new Date().toISOString(),
      read: false,
    }));
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify(notifications)
    );
    renderCenter();

    const first = screen.getByText("通知0", { exact: true });
    const second = screen.getByText("通知1", { exact: true });
    const observer = MockIntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();
    observer?.emit(first.closest("li") as HTMLElement, 0.5);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(
      within(first.closest("li")!).queryByLabelText("未読")
    ).not.toBeInTheDocument();
    expect(
      within(second.closest("li")!).getByLabelText("未読")
    ).toBeInTheDocument();

    const updatedObserver = MockIntersectionObserver.instances.at(-1);
    updatedObserver?.emit(second.closest("li") as HTMLElement, 0.5);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByLabelText("未読")).not.toBeInTheDocument();
  });

  it("通知を表示し、エラー内容の展開とdiagnostic詳細を行う", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));

    const row = await screen.findByText("更新失敗", { exact: true });
    expect(screen.getAllByText("更新できませんでした").length).toBeGreaterThan(
      0
    );

    await user.click(row);
    expect(screen.queryByLabelText("未読")).not.toBeInTheDocument();

    expect(screen.getByText("SERVER_ERROR")).toBeInTheDocument();
    expect(screen.getByText("req-123")).toBeInTheDocument();
    expect(screen.getByText("/api/teachers/1")).toBeInTheDocument();
    expect(screen.getByText("発生時刻")).toBeInTheDocument();
    expect(
      within(row.closest("li")!).getByRole("button", {
        name: "通知を小さくする",
      })
    ).toBeInTheDocument();
  });

  it("通知行へfocusすると即座に既読にする", async () => {
    renderCenter();
    fireEvent.click(screen.getByRole("button", { name: "seed" }));

    const row = screen.getByRole("button", { name: /通知内容を表示$/ });
    fireEvent.focus(row);
    expect(screen.queryByLabelText("未読")).not.toBeInTheDocument();
  });

  it("通知本体の矢印キー・Home・Endで一覧を移動する", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    await user.click(screen.getByRole("button", { name: "seed" }));
    const messages = screen.getAllByRole("button", {
      name: /通知内容を表示$/,
    });

    messages[0].focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(messages[1]);
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(messages[0]);
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(messages[1]);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(messages[1]);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(messages[0]);
  });

  it("最初の通知からArrowUpでBellへfocusを戻す", async () => {
    const user = userEvent.setup();
    const onFocusTrigger = vi.fn();
    render(
      <FeedbackProvider userId="test-user">
        <SeedNotification />
        <AppNotificationCenter onFocusTrigger={onFocusTrigger} />
      </FeedbackProvider>
    );
    await user.click(screen.getByRole("button", { name: "seed" }));
    const message = screen.getByRole("button", { name: /通知内容を表示$/ });
    message.focus();
    await user.keyboard("{ArrowUp}");
    expect(onFocusTrigger).toHaveBeenCalledTimes(1);
  });

  it("Diagnosticのない短い通知では詳細toggleを提供しない", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <SeedSimpleNotification />
        <AppNotificationCenter />
      </FeedbackProvider>
    );
    await user.click(screen.getByRole("button", { name: "simple-seed" }));
    const message = screen.getByRole("button", {
      name: /完了、成功、未読、通知内容$/,
    });
    expect(message).not.toHaveAttribute("aria-expanded");
    message.focus();
    await user.keyboard("{ArrowRight}");
    expect(message).not.toHaveAttribute("aria-expanded");
  });

  it("ArrowRightとArrowLeftで通知詳細を開閉する", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    const message = screen.getByRole("button", { name: /通知内容を表示$/ });

    message.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("SERVER_ERROR")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByText("SERVER_ERROR")).not.toBeInTheDocument();
  });

  it("通知全体のクリックで詳細を開閉できる", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    const row = screen.getByText("更新失敗", { exact: true }).closest("li");
    expect(row).not.toBeNull();
    await user.click(row!);
    expect(screen.getByText("/api/teachers/1")).toBeInTheDocument();
    await user.click(row!);
    expect(screen.queryByText("/api/teachers/1")).not.toBeInTheDocument();
  });

  it("ゴミ箱アイコンから履歴を削除できる", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "すべて削除" })).toBeEnabled()
    );
    await user.click(screen.getByRole("button", { name: "すべて削除" }));
    expect(screen.getByText("通知はありません")).toBeInTheDocument();
  });

  it("通知行の削除ボタンから個別に履歴を削除できる", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));

    await user.click(
      await screen.findByRole("button", { name: "更新失敗を削除" })
    );

    expect(screen.getByText("通知はありません")).toBeInTheDocument();
  });

  it("個別削除後は次の通知本体へfocusを移す", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    await user.click(screen.getByRole("button", { name: "seed" }));
    const rows = screen.getAllByRole("listitem");
    const secondMessage = within(rows[1]).getByRole("button", {
      name: /通知内容を表示$/,
    });
    await user.click(
      within(rows[0]).getByRole("button", { name: "更新失敗を削除" })
    );
    expect(document.activeElement).toBe(secondMessage);
  });

  it("本文で展開し、縮小ボタンで閉じて再展開後も個別に削除できる", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    await user.click(screen.getByRole("button", { name: "seed" }));
    const row = screen.getAllByRole("listitem")[0];
    const message = within(row).getByRole("button", {
      name: /通知内容を表示$/,
    });

    await user.hover(row);
    await user.click(message);
    expect(message).toHaveAttribute("aria-expanded", "true");
    expect(within(row).getByText("req-123")).toBeInTheDocument();
    await user.click(
      within(row).getByRole("button", { name: "通知を小さくする" })
    );
    expect(message).toHaveAttribute("aria-expanded", "false");
    expect(within(row).queryByText("req-123")).not.toBeInTheDocument();
    expect(within(row).getByText("更新できませんでした")).toBeInTheDocument();

    await user.click(message);
    await user.click(
      within(row).getByRole("button", { name: "更新失敗を削除" })
    );
    expect(row).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("本文の展開・縮小・削除をキーボードでも操作できる", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    const message = screen.getByRole("button", { name: /通知内容を表示$/ });
    act(() => message.focus());
    await user.keyboard("{Enter}");
    expect(screen.getByText("req-123")).toBeInTheDocument();
    const minimize = within(message.closest("li")!).getByRole("button", {
      name: "通知を小さくする",
    });
    act(() => minimize.focus());
    await user.keyboard(" ");
    expect(screen.queryByText("req-123")).not.toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "更新失敗を削除" }).focus());
    await user.keyboard("{Enter}");
    expect(screen.getByText("通知はありません")).toBeInTheDocument();
  });

  it("詳細ヘッダーのコピーから通知内容を取得できる", async () => {
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: vi.fn() },
      });
    }
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));
    await user.click(screen.getByRole("button", { name: /通知内容を表示$/ }));
    const copyButton = screen.getByRole("button", {
      name: "通知内容をコピー",
    });
    fireEvent.click(copyButton);

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("更新失敗")
      )
    );
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("req-123"));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "コピーしました" })
      ).toBeInTheDocument()
    );
    expect(
      screen
        .getByRole("button", { name: "コピーしました" })
        .querySelector("svg")
    ).toHaveClass("lucide-check");
  });
});
