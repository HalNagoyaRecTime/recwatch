import { Background, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import type { NotificationScheduleDetail } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { scheduleStatusLabel } from "~/features/notifications/components/detail/notification-detail-display";

export function NotificationDeliveryFlow({
  detail,
}: {
  detail: NotificationScheduleDetail;
}) {
  const delivery = detail.deliveryProgress;
  const resolved = detail.recipientProgress.status === "resolved";
  const audience = detail.audienceProgress;
  const stages = [
    {
      title: "配信回",
      value: scheduleStatusLabel[detail.status],
      caption: `Schedule #${detail.notificationScheduleId}`,
    },
    {
      title: "対象者の確定",
      value: resolved
        ? `${detail.recipientProgress.count.toLocaleString()}人`
        : "未確定",
      caption: `対象指定 ${audience.resolvedCount} / ${audience.totalCount} 解決`,
    },
    {
      title: "Push送信",
      value: `${delivery.totalCount.toLocaleString()}送信先`,
      caption: `待機 ${delivery.pendingCount} / 送信中 ${delivery.sendingCount}`,
    },
    {
      title: "送信結果",
      value: `FCM受付 ${delivery.sentCount.toLocaleString()}件`,
      caption: `再送待ち ${delivery.retryWaitCount} / 失敗 ${delivery.failedCount} / 停止 ${delivery.stoppedCount}`,
    },
  ];
  const nodes: Node[] = stages.map((stage, index) => ({
    id: String(index),
    position: { x: index * 220, y: 26 },
    data: {
      label: (
        <div className="space-y-2 text-left">
          <p className="text-text-muted text-xs">{stage.title}</p>
          <p className="text-text-base text-base font-semibold">
            {stage.value}
          </p>
          <p className="text-text-muted text-xs">{stage.caption}</p>
        </div>
      ),
    },
    className:
      "!border-border-base !bg-surface-base !text-text-base !shadow-none !rounded-lg !p-4",
    style: { width: 190, minHeight: 112 },
    draggable: false,
    selectable: false,
  }));
  const edges: Edge[] = [0, 1, 2].map((index) => ({
    id: `edge-${index}`,
    source: String(index),
    target: String(index + 1),
    type: "smoothstep",
  }));
  return (
    <ScrollbarArea orientation="horizontal">
      <div className="h-44 min-w-[860px]" aria-label="配信処理の流れ">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
        >
          <Background gap={18} size={1} />
        </ReactFlow>
      </div>
    </ScrollbarArea>
  );
}
