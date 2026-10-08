import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  NotificationScheduleNode,
  type ScheduleFlowNode,
} from "~/features/notifications/components/monitor/NotificationScheduleNode";
import type { MonitorSchedule } from "~/features/notifications/hooks/notification-monitor-data";
import "~/features/notifications/components/monitor/notification-monitor.css";
const nodeTypes = { schedule: NotificationScheduleNode };

export function NotificationMonitorGraph({
  item,
  onOpen,
}: {
  item: MonitorSchedule;
  onOpen: (id: number) => void;
}) {
  const [height, setHeight] = useState(180);
  const container = useRef<HTMLDivElement>(null);
  const [instance, setInstance] =
    useState<ReactFlowInstance<ScheduleFlowNode> | null>(null);
  useEffect(() => {
    if (
      !instance ||
      !container.current ||
      typeof ResizeObserver === "undefined"
    )
      return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(
        () => void instance.fitView({ padding: 0.08 })
      );
    });
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [instance]);
  const onMeasure = useCallback(
    (_id: string, value: number) => setHeight(value),
    []
  );
  const nodes = useMemo<ScheduleFlowNode[]>(
    () => [
      {
        id: String(item.summary.notificationScheduleId),
        type: "schedule",
        position: { x: 0, y: 0 },
        style: { width: 1120, height },
        data: { item, onOpen, onMeasure },
        draggable: false,
        selectable: false,
        focusable: false,
      },
    ],
    [item, onOpen, onMeasure, height]
  );
  return (
    <div
      ref={container}
      className="notification-monitor monitor-canvas"
      aria-label="選択した配信の処理フロー"
    >
      <ReactFlow<ScheduleFlowNode>
        key={item.summary.notificationScheduleId}
        onInit={setInstance}
        onNodeClick={(_, node) =>
          onOpen(node.data.item.summary.notificationScheduleId)
        }
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
