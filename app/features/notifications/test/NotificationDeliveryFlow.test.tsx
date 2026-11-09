import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationDeliveryFlow } from "~/features/notifications/components/detail/NotificationDeliveryFlow";
import {
  cloneFixture,
  notificationScheduleDetailFixture,
} from "~/features/notifications/mock/notification-fixtures";

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({
    nodes,
    nodeTypes,
  }: {
    nodes: Array<{ id: string; type: string; data: unknown }>;
    nodeTypes: Record<
      string,
      React.ComponentType<{ id: string; data: unknown }>
    >;
  }) => (
    <div>
      {nodes.map((node) => {
        const Component = nodeTypes[node.type];
        return <Component key={node.id} id={node.id} data={node.data} />;
      })}
    </div>
  ),
  Background: () => null,
  Controls: () => null,
}));

afterEach(cleanup);

describe("配信処理フロー", () => {
  it("未確定の人数を確定値として表示せず、APIの集計をそのまま表示する", () => {
    const detail = cloneFixture(notificationScheduleDetailFixture);
    detail.recipientProgress = { count: 40, status: "pending" };
    detail.status = "stopped";
    render(<NotificationDeliveryFlow detail={detail} />);
    expect(screen.getAllByText("未確定").length).toBeGreaterThan(0);
    expect(screen.queryByText("40")).not.toBeInTheDocument();
    expect(screen.getByText("配信回")).toBeInTheDocument();
    expect(screen.getByText("停止")).toBeInTheDocument();
    expect(screen.getByText("対象指定 4 / 4 解決")).toBeInTheDocument();
    expect(screen.getByText("42件")).toBeInTheDocument();
    expect(screen.getByText("成功 38件")).toBeInTheDocument();
  });
});
