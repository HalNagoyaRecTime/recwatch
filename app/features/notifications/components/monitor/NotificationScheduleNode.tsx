import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import {
  useUpdateNodeInternals,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  getMonitorSchedule,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";
import { formatNotificationDateTime } from "~/features/notifications/components/list/notification-display";

export type ScheduleFlowNode = Node<
  {
    item: MonitorSchedule;
    onOpen: (id: number) => void;
    onMeasure: (id: string, height: number) => void;
  },
  "schedule"
>;

export function NotificationScheduleNode({
  id,
  data,
}: NodeProps<ScheduleFlowNode>) {
  const element = useRef<HTMLElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const { item, onOpen, onMeasure } = data;
  const schedule = getMonitorSchedule(item);
  const detail = item.detail;
  const delivery = detail?.deliveryProgress;
  const started = schedule.status !== "scheduled";
  const resolved = detail?.recipientProgress.status === "resolved";
  const fcmState = !delivery
    ? { badge: "集計取得失敗", tone: "attention" }
    : delivery.totalCount === 0
      ? { badge: "配送なし", tone: "waiting" }
      : delivery.failedCount > 0 || delivery.retryWaitCount > 0
        ? { badge: "要確認", tone: "attention" }
        : delivery.stoppedCount > 0
          ? { badge: "停止あり", tone: "attention" }
          : delivery.pendingCount > 0 || delivery.sendingCount > 0
            ? { badge: "未送信あり", tone: "waiting" }
            : delivery.sentCount === delivery.totalCount
              ? { badge: "受付成功", tone: "done" }
              : { badge: "未送信あり", tone: "waiting" };
  const stages = [
    {
      label: "NOTIFICATION",
      value: schedule.content.push.title,
      caption: `Notification #${schedule.notificationId}`,
      badge: "作成済み",
      tone: "done",
    },
    {
      label: "SCHEDULE",
      value: formatNotificationDateTime(schedule.sendAt),
      caption: `Schedule #${schedule.notificationScheduleId}`,
      badge: started ? "開始済み" : "配信待ち",
      tone: started ? "done" : "waiting",
    },
    {
      label: "AUDIENCE",
      value: detail
        ? `${detail.audienceProgress.resolvedCount} / ${detail.audienceProgress.totalCount}`
        : "—",
      caption: "配信対象の解決",
      badge: resolved ? "resolved" : "解決待ち",
      tone: resolved ? "done" : "waiting",
    },
    {
      label: "RECIPIENTS",
      value: detail?.recipientProgress.count.toLocaleString() ?? "—",
      caption: "対象User数",
      badge: resolved ? "確定済み" : "未確定",
      tone: resolved ? "done" : "waiting",
    },
    {
      label: "PUSH DELIVERIES",
      value: delivery?.totalCount.toLocaleString() ?? "—",
      caption: delivery
        ? `Pending ${delivery.pendingCount} / Sending ${delivery.sendingCount}`
        : "集計を取得できません",
      badge:
        schedule.status === "sending"
          ? "送信中"
          : schedule.status === "scheduled"
            ? "待機中"
            : "配送集計",
      tone: schedule.status === "sending" ? "active" : "waiting",
    },
    {
      label: "FCM",
      value: delivery?.sentCount.toLocaleString() ?? "—",
      caption: delivery
        ? `Retry ${delivery.retryWaitCount} / Failed ${delivery.failedCount}`
        : "集計を取得できません",
      badge: fcmState.badge,
      tone: fcmState.tone,
    },
  ];
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
      aria-label={`配信 #${schedule.notificationScheduleId}`}
      className="monitor-pipeline"
    >
      {stages.map((stage, index) => (
        <div className="monitor-stage-group" key={stage.label}>
          {index > 0 && (
            <ArrowRight
              aria-hidden="true"
              className={`monitor-arrow ${index >= 4 && schedule.status === "sending" ? "monitor-arrow-active" : ""}`}
            />
          )}
          <button
            type="button"
            className={`nodrag nopan monitor-stage monitor-stage-${stage.tone}`}
            onClick={() => onOpen(schedule.notificationScheduleId)}
            aria-label={`${schedule.content.push.title}の${stage.label}配信詳細`}
          >
            <span className="monitor-stage-label">{stage.label}</span>
            <strong>{stage.value}</strong>
            <span className="monitor-stage-caption">{stage.caption}</span>
            <span className="monitor-stage-badge">{stage.badge}</span>
          </button>
        </div>
      ))}
    </article>
  );
}
