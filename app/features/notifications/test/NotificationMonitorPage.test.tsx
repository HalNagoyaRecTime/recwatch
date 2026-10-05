import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ComponentProps } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NodeProps, ReactFlow } from "@xyflow/react";

import {
  createMockNotificationMonitorApi,
  createNotificationMonitorFixtures,
} from "~/features/notifications/mock/notification-monitor-api";
import { NotificationMonitorPage } from "~/features/notifications/pages/NotificationMonitorPage";

const graph = vi.hoisted(() => ({
  props: null as ComponentProps<typeof ReactFlow> | null,
  updateInternals: vi.fn(),
}));
vi.mock("@xyflow/react", () => ({
  ReactFlow: (props: ComponentProps<typeof ReactFlow>) => {
    graph.props = props;
    return (
      <div>
        {props.nodes?.map((node) => {
          const Component = props.nodeTypes?.[node.type ?? "default"];
          return Component
            ? createElement(Component, {
                ...node,
                key: node.id,
                id: node.id,
                data: node.data,
                isConnectable: false,
                positionAbsoluteX: node.position.x,
                positionAbsoluteY: node.position.y,
                selected: false,
                dragging: false,
                draggable: false,
                selectable: false,
                deletable: false,
                zIndex: 0,
                type: node.type ?? "default",
              } as NodeProps & { key: string })
            : null;
        })}
        {props.children}
      </div>
    );
  },
  Background: () => null,
  Controls: () => null,
  useUpdateNodeInternals: () => graph.updateInternals,
}));

const now = () => Date.parse("2026-10-04T12:00:00+09:00");
const observers: Array<{
  element?: Element;
  callback: ResizeObserverCallback;
  disconnect: () => void;
}> = [];
beforeEach(() => {
  observers.length = 0;
  graph.updateInternals.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      record: (typeof observers)[number];
      constructor(callback: ResizeObserverCallback) {
        this.record = { callback, disconnect: vi.fn() };
        observers.push(this.record);
      }
      observe(element: Element) {
        this.record.element = element;
      }
      disconnect() {
        this.record.disconnect();
      }
    }
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderPage(
  api = createMockNotificationMonitorApi(
    createNotificationMonitorFixtures(now())
  ),
  reportFeedback = vi.fn()
) {
  return {
    ...render(
      <MemoryRouter>
        <NotificationMonitorPage
          api={api}
          reportFeedback={reportFeedback}
          now={now}
          refreshIntervalMs={0}
        />
      </MemoryRouter>
    ),
    reportFeedback,
  };
}

describe("配信モニター", () => {
  it("選択したScheduleの処理フローと配送内訳を表示する", async () => {
    renderPage();
    const card = await screen.findByRole("article", { name: "配信 #503" });
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(within(card).getByText("40")).toBeInTheDocument();
    expect(within(card).getByText("42")).toBeInTheDocument();
    expect(within(card).getByText("PUSH DELIVERIES")).toBeInTheDocument();
    expect(within(card).getByText("FCM")).toBeInTheDocument();
    expect(graph.props?.nodesDraggable).toBe(false);
    expect(graph.props?.nodesConnectable).toBe(false);
    expect(graph.props?.deleteKeyCode).toBeNull();
    expect(graph.props?.edges).toEqual([]);
    expect(graph.props?.nodes?.every((node) => node.draggable === false)).toBe(
      true
    );
    expect(
      screen.queryByRole("button", { name: /再送する|停止する|予約を取消/ })
    ).not.toBeInTheDocument();
  });

  it("カードをキーボードから開き、Schedule詳細と通知へのリンクを表示する", async () => {
    const user = userEvent.setup();
    renderPage();
    const button = await screen.findByRole("button", {
      name: "詳細を開く",
    });
    button.focus();
    await user.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", { name: "配信詳細" });
    expect(within(dialog).getByText("40人")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: "通知詳細を開く" })
    ).toHaveAttribute("href", "/notifications/103");
    expect(
      within(dialog).getByText(
        "FCM受付成功は、端末での表示や既読を示しません。"
      )
    ).toBeInTheDocument();
  });

  it("配信選択を切り替え、フローと要約を同じScheduleに更新する", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("article", { name: "配信 #503" });
    await user.selectOptions(
      screen.getByRole("combobox", { name: "表示する配信" }),
      "501"
    );
    expect(
      screen.getByRole("article", { name: "配信 #501" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("article", { name: "配信 #503" })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /通知103.*送信中/ }));
    expect(
      screen.getByRole("article", { name: "配信 #503" })
    ).toBeInTheDocument();
  });

  it("フローの高さ変更をReact Flowに通知する", async () => {
    const { unmount } = renderPage();
    await screen.findByRole("article", { name: "配信 #503" });
    const observer = observers.find(
      (item) => item.element?.getAttribute("aria-label") === "配信 #503"
    )!;
    act(() =>
      observer.callback(
        [
          {
            borderBoxSize: [{ blockSize: 240 }],
          } as unknown as ResizeObserverEntry,
        ],
        {} as ResizeObserver
      )
    );
    await waitFor(() =>
      expect(graph.updateInternals).toHaveBeenCalledWith("503")
    );
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("状態別一覧に全Scheduleを配置し、再取得したDB状態で列を移動する", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    const user = userEvent.setup();
    renderPage(createMockNotificationMonitorApi(fixtures));
    await screen.findByRole("article", { name: "配信 #503" });
    await user.click(screen.getByRole("button", { name: "状態別一覧" }));
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(
      graph.props?.nodes?.filter((node) => node.type === "scheduleOverview")
    ).toHaveLength(7);
    expect(
      graph.props?.nodes?.find((node) => node.id === "503")?.position.x
    ).toBe(704);
    expect(graph.props?.nodesDraggable).toBe(false);
    const card = screen.getByRole("article", { name: "状態別配信 #503" });
    expect(within(card).getByText("40人")).toBeInTheDocument();
    expect(within(card).getByText("42件")).toBeInTheDocument();
    fixtures.find((item) => item.notificationScheduleId === 503)!.status =
      "completed";
    await user.click(screen.getByRole("button", { name: "再読み込み" }));
    await waitFor(() =>
      expect(
        graph.props?.nodes?.find((node) => node.id === "503")?.position.x
      ).toBe(1056)
    );
    await user.click(within(card).getByRole("button"));
    expect(
      await screen.findByRole("dialog", { name: "配信詳細" })
    ).toBeInTheDocument();
  });

  it("状態別カードの高さが変わると同じ列の後続Nodeをずらす", async () => {
    renderPage();
    await screen.findByRole("article", { name: "配信 #503" });
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "状態別一覧" }));
    const before = graph.props?.nodes?.find((node) => node.id === "601")
      ?.position.y;
    const observer = observers.find(
      (entry) => entry.element?.getAttribute("aria-label") === "状態別配信 #501"
    )!;
    act(() =>
      observer.callback(
        [
          {
            borderBoxSize: [{ blockSize: 600 }],
          } as unknown as ResizeObserverEntry,
        ],
        {} as ResizeObserver
      )
    );
    await waitFor(() =>
      expect(
        graph.props?.nodes?.find((node) => node.id === "601")?.position.y
      ).toBe((before ?? 0) + 260)
    );
    expect(graph.updateInternals).toHaveBeenCalledWith("501");
  });

  it("空状態と読み込み中を区別する", async () => {
    renderPage(createMockNotificationMonitorApi([]));
    expect(screen.getByRole("status")).toHaveTextContent("読み込み中");
    expect(
      await screen.findByText("表示対象の配信はありません。")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("選択した配信の処理フロー")
    ).not.toBeInTheDocument();
  });

  it("初期エラーから再読み込みで復旧する", async () => {
    const api = createMockNotificationMonitorApi([]);
    vi.spyOn(api, "list").mockRejectedValueOnce(new Error("通信失敗"));
    renderPage(api);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "読み込めませんでした"
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "再読み込み" }));
    expect(
      await screen.findByText("表示対象の配信はありません。")
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("集計取得に失敗したカードで0件を捏造せず、詳細から再試行できる", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const getDetail = api.getDetail;
    vi.spyOn(api, "getDetail").mockImplementation((id) =>
      id === 503 ? Promise.reject(new Error("通信失敗")) : getDetail(id)
    );
    renderPage(api);
    const card = await screen.findByRole("article", { name: "配信 #503" });
    expect(
      screen.getByText("配信集計を読み込めませんでした。")
    ).toBeInTheDocument();
    expect(within(card).queryByText("配送総数")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await userEvent
      .setup()
      .click(
        within(card).getByRole("button", { name: /NOTIFICATION配信詳細/ })
      );
    const dialog = await screen.findByRole("dialog", { name: "配信詳細" });
    vi.mocked(api.getDetail).mockImplementation(getDetail);
    await userEvent
      .setup()
      .click(
        within(dialog).getByRole("button", { name: "配信集計を再読み込み" })
      );
    await waitFor(() =>
      expect(within(dialog).getByText("42件")).toBeInTheDocument()
    );
  });

  it("refresh失敗をFeedbackへ報告し、前回のカードを保持する", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const { reportFeedback } = renderPage(api);
    await screen.findByRole("article", { name: "配信 #503" });
    vi.spyOn(api, "list").mockRejectedValueOnce(new Error("通信失敗"));
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "再読み込み" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "前回の表示を保持しています"
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(reportFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "background-error" })
    );
  });
});
