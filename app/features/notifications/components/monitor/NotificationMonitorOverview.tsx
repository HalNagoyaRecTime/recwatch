import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  useUpdateNodeInternals,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { formatNotificationDateTime } from "~/features/notifications/components/list/notification-display";
import { NotificationMonitorProgress } from "~/features/notifications/components/monitor/NotificationMonitorProgress";
import {
  getMonitorColumn,
  getMonitorSchedule,
  layoutMonitorSchedules,
  monitorCardWidth,
  monitorColumnGap,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";
import "@xyflow/react/dist/style.css";

type ScheduleNode = Node<
  {
    item: MonitorSchedule;
    onOpen: (id: number) => void;
    onMeasure: (id: string, height: number) => void;
  },
  "scheduleOverview"
>;
type ColumnNode = Node<{ label: string; count: number }, "statusColumn">;
type OverviewNode = ScheduleNode | ColumnNode;
const columns = ["配信待ち", "対象解決中", "送信中", "処理終了"];

function StatusColumn({ data }: NodeProps<ColumnNode>) {
  return (
    <div className="monitor-overview-column">
      <strong>{data.label}</strong>
      <span>{data.count}件</span>
    </div>
  );
}
function ScheduleCard({ id, data }: NodeProps<ScheduleNode>) {
  const element = useRef<HTMLElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const { item, onMeasure, onOpen } = data;
  const schedule = getMonitorSchedule(item);
  useEffect(() => {
    if (!element.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const height =
        entries[0]?.borderBoxSize?.[0]?.blockSize ??
        element.current?.offsetHeight;
      if (height && height > 0) {
        onMeasure(id, Math.ceil(height));
        updateNodeInternals(id);
      }
    });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [id, onMeasure, updateNodeInternals]);
  return (
    <article
      ref={element}
      aria-label={`状態別配信 #${schedule.notificationScheduleId}`}
      className="monitor-overview-card nopan"
    >
      <div className="flex items-center justify-between">
        <NotificationStatusBadge status={schedule.status} />
        <span className="text-text-muted text-xs">
          #{schedule.notificationScheduleId}
        </span>
      </div>
      <button
        type="button"
        className="nodrag mt-3 text-left text-sm font-semibold"
        onClick={() => onOpen(schedule.notificationScheduleId)}
        aria-label={`${schedule.content.push.title}の状態別配信詳細`}
      >
        {schedule.content.push.title}
      </button>
      <p className="text-text-muted my-3 text-xs">
        {formatNotificationDateTime(schedule.sendAt)}
      </p>
      {item.detail ? (
        <NotificationMonitorProgress detail={item.detail} />
      ) : (
        <p className="text-tone-danger-text text-xs">
          {item.errorMessage ?? "配信集計を取得中です。"}
        </p>
      )}
    </article>
  );
}
const nodeTypes = {
  scheduleOverview: ScheduleCard,
  statusColumn: StatusColumn,
};

export function NotificationMonitorOverview({
  items,
  onOpen,
}: {
  items: readonly MonitorSchedule[];
  onOpen: (id: number) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [instance, setInstance] =
    useState<ReactFlowInstance<OverviewNode> | null>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const onMeasure = useCallback(
    (id: string, height: number) =>
      setHeights((current) =>
        current[id] === height ? current : { ...current, [id]: height }
      ),
    []
  );
  const nodes = useMemo<OverviewNode[]>(
    () => [
      ...columns.map((label, column): ColumnNode => ({
        id: `status-${column}`,
        type: "statusColumn",
        data: {
          label,
          count: items.filter(
            (item) =>
              getMonitorColumn(getMonitorSchedule(item).status) === column
          ).length,
        },
        position: { x: column * (monitorCardWidth + monitorColumnGap), y: 0 },
        style: { width: monitorCardWidth },
        draggable: false,
        selectable: false,
        focusable: false,
      })),
      ...layoutMonitorSchedules(items, heights).map(
        ({ id, position, item }): ScheduleNode => ({
          id,
          type: "scheduleOverview",
          data: { item, onOpen, onMeasure },
          position,
          style: { width: monitorCardWidth },
          draggable: false,
          selectable: false,
          focusable: false,
        })
      ),
    ],
    [items, heights, onMeasure, onOpen]
  );
  const firstRowIds = nodes
    .filter((node) => node.type === "statusColumn" || node.position.y === 72)
    .map((node) => ({ id: node.id }));
  const layoutKey = nodes
    .map(
      (node) =>
        `${node.id}:${node.position.x}:${node.position.y}:${heights[node.id] ?? 0}`
    )
    .join("|");
  const firstRowRef = useRef(firstRowIds);
  useEffect(() => {
    firstRowRef.current = firstRowIds;
  });
  useEffect(() => {
    if (!instance) return;
    const frame = requestAnimationFrame(
      () =>
        void instance.fitView({
          nodes: firstRowRef.current,
          padding: 0.1,
          maxZoom: 1,
        })
    );
    return () => cancelAnimationFrame(frame);
  }, [instance, layoutKey]);
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
        () =>
          void instance.fitView({
            nodes: firstRowRef.current,
            padding: 0.1,
            maxZoom: 1,
          })
      );
    });
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [instance]);
  return (
    <div
      ref={container}
      className="notification-monitor monitor-overview"
      aria-label="状態別の配信一覧"
    >
      <ReactFlow<OverviewNode>
        onNodeClick={(_, node) => {
          if (node.type === "scheduleOverview")
            onOpen(node.data.item.summary.notificationScheduleId);
        }}
        onInit={setInstance}
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={[]}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        zoomOnDoubleClick={false}
        ariaLabelConfig={{
          "controls.ariaLabel": "一覧の表示操作",
          "controls.zoomIn.ariaLabel": "一覧を拡大",
          "controls.zoomOut.ariaLabel": "一覧を縮小",
          "controls.fitView.ariaLabel": "一覧を全体表示",
        }}
      >
        <Background gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
