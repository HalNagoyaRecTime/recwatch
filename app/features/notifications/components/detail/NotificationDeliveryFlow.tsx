import { ArrowRight } from "lucide-react";
import {
  Background,
  Controls,
  ReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { NotificationScheduleDetail } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { formatNotificationDateTime } from "~/features/notifications/components/list/notification-display";
import { scheduleStatusLabel } from "~/features/notifications/components/detail/notification-detail-display";
import "~/features/notifications/components/monitor/notification-monitor.css";

type StageTone = "done" | "active" | "waiting" | "attention";
type Stage = {
  label: string;
  value: string;
  caption: string;
  badge: string;
  tone: StageTone;
};

type FlowData = { detail: NotificationScheduleDetail };
type FlowNode = Node<FlowData, "stages">;

function buildStages(detail: NotificationScheduleDetail): Stage[] {
  const delivery = detail.deliveryProgress;
  const resolved = detail.recipientProgress.status === "resolved";
  const started = detail.status !== "scheduled";
  const percent =
    delivery.totalCount > 0
      ? ((delivery.sentCount / delivery.totalCount) * 100).toFixed(1)
      : "0.0";
  const needsAttention =
    delivery.failedCount > 0 ||
    delivery.retryWaitCount > 0 ||
    delivery.stoppedCount > 0;
  return [
    {
      label: "配信回",
      value: scheduleStatusLabel[detail.status],
      caption: `配信予定 ${formatNotificationDateTime(detail.sendAt)}`,
      badge: `Schedule #${detail.notificationScheduleId}`,
      tone: started ? "done" : "waiting",
    },
    {
      label: "対象者",
      value: resolved
        ? `${detail.recipientProgress.count.toLocaleString()}人`
        : "未確定",
      caption: `対象指定 ${detail.audienceProgress.resolvedCount} / ${detail.audienceProgress.totalCount} 解決`,
      badge: resolved ? "確定済み" : "確定待ち",
      tone: resolved ? "done" : "waiting",
    },
    {
      label: "送信先",
      value: `${delivery.totalCount.toLocaleString()}件`,
      caption: `待機 ${delivery.pendingCount} / 送信中 ${delivery.sendingCount} / 再送待ち ${delivery.retryWaitCount}`,
      badge: "送信先単位",
      tone:
        delivery.sendingCount > 0
          ? "active"
          : delivery.pendingCount > 0
            ? "waiting"
            : "done",
    },
    {
      label: "送信結果",
      value: `成功 ${delivery.sentCount.toLocaleString()}件`,
      caption: `失敗 ${delivery.failedCount} / 停止 ${delivery.stoppedCount}`,
      badge: `${percent}%`,
      tone: needsAttention
        ? "attention"
        : delivery.totalCount === 0
          ? "waiting"
          : "done",
    },
  ];
}

function DeliveryStages({ data }: NodeProps<FlowNode>) {
  const stages = buildStages(data.detail);
  return (
    <div className="monitor-pipeline" style={{ width: "100%" }}>
      {stages.map((stage, index) => (
        <div className="monitor-stage-group" key={stage.label}>
          {index > 0 && (
            <ArrowRight aria-hidden="true" className="monitor-arrow" />
          )}
          <div
            className={`monitor-stage monitor-stage-${stage.tone}`}
            style={{ cursor: "default" }}
          >
            <span className="monitor-stage-label">{stage.label}</span>
            <strong>{stage.value}</strong>
            <span className="monitor-stage-caption">{stage.caption}</span>
            <span className="monitor-stage-badge">{stage.badge}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const nodeTypes = { stages: DeliveryStages };

export function NotificationDeliveryFlow({
  detail,
}: {
  detail: NotificationScheduleDetail;
}) {
  const nodes: FlowNode[] = [
    {
      id: "stages",
      type: "stages",
      position: { x: 0, y: 0 },
      style: { width: 1040, height: 220 },
      data: { detail },
      draggable: false,
      selectable: false,
      focusable: false,
    },
  ];
  return (
    <div
      className="notification-monitor monitor-canvas"
      aria-label="配信状況の流れ"
    >
      <ReactFlow<FlowNode>
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={[]}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.1}
        maxZoom={1}
        zoomOnDoubleClick={false}
        ariaLabelConfig={{
          "controls.ariaLabel": "表示操作",
          "controls.zoomIn.ariaLabel": "拡大",
          "controls.zoomOut.ariaLabel": "縮小",
          "controls.fitView.ariaLabel": "全体を表示",
        }}
      >
        <Background gap={18} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
