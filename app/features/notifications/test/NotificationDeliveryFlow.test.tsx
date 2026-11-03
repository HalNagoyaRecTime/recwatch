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
  }: {
    nodes: Array<{ id: string; data: { label: React.ReactNode } }>;
  }) => (
    <div>
      {nodes.map((node) => (
        <div key={node.id}>{node.data.label}</div>
      ))}
    </div>
  ),
  Background: () => null,
}));
afterEach(cleanup);

describe("配信処理フロー", () => {
  it("未確定の人数を確定値として表示せず、実際の件数を表示する", () => {
    const detail = cloneFixture(notificationScheduleDetailFixture);
    detail.recipientProgress = { count: 40, status: "pending" };
    detail.status = "stopped";
    render(<NotificationDeliveryFlow detail={detail} />);
    expect(screen.getByText("未確定")).toBeInTheDocument();
    expect(screen.queryByText("40人")).not.toBeInTheDocument();
    expect(screen.getByText("停止")).toBeInTheDocument();
    expect(screen.getByText("42送信先")).toBeInTheDocument();
    expect(
      screen.getByText("再送待ち 2 / 失敗 2 / 停止 0")
    ).toBeInTheDocument();
  });
});
