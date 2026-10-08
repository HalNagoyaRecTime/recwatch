import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { NotificationMonitorDetail } from "~/features/notifications/components/monitor/NotificationMonitorDetail";
import { NotificationMonitorOverview } from "~/features/notifications/components/monitor/NotificationMonitorOverview";
import { NotificationMonitorGraph } from "~/features/notifications/components/monitor/NotificationMonitorGraph";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { formatNotificationDateTime } from "~/features/notifications/components/list/notification-display";
import { getMonitorSchedule } from "~/features/notifications/hooks/notification-monitor-data";
import type { NotificationFeedbackReporter } from "~/features/notifications/hooks/notification-feedback";
import { useNotificationMonitor } from "~/features/notifications/hooks/useNotificationMonitor";
import "~/features/notifications/components/monitor/notification-monitor.css";

type Props = {
  api: NotificationScheduleQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
  now?: () => number;
  refreshIntervalMs?: number;
};
const statusLabels = {
  scheduled: "配信待ち",
  resolving: "対象解決中",
  sending: "送信中",
  completed: "配信完了",
  failed: "配信失敗",
  stopped: "停止済み",
};

export function NotificationMonitorPage(props: Props) {
  const state = useNotificationMonitor(props);
  const [overview, setOverview] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const item =
    state.items.find(
      (entry) => entry.summary.notificationScheduleId === viewId
    ) ??
    state.items.find(
      (entry) => getMonitorSchedule(entry).status === "sending"
    ) ??
    state.items[0];
  const schedule = item && getMonitorSchedule(item);
  const detail = item?.detail;
  const delivery = detail?.deliveryProgress;
  const percent = (count: number) =>
    delivery && delivery.totalCount > 0
      ? ((count / delivery.totalCount) * 100).toFixed(1)
      : "0.0";
  const metrics = [
    [
      "Schedule状態",
      schedule ? statusLabels[schedule.status] : "—",
      schedule ? `DB: ${schedule.status}` : "—",
    ],
    [
      "確定Recipient",
      detail?.recipientProgress.count.toLocaleString() ?? "—",
      detail?.recipientProgress.status === "pending"
        ? "User単位・未確定"
        : "User単位",
    ],
    ["Push送信先", delivery?.totalCount.toLocaleString() ?? "—", "Token単位"],
    [
      "送信成功",
      delivery?.sentCount.toLocaleString() ?? "—",
      delivery ? `${percent(delivery.sentCount)}%` : "—",
    ],
    [
      "要確認",
      delivery
        ? `Retry ${delivery.retryWaitCount} / Failed ${delivery.failedCount}`
        : "—",
      "再送待ち / 失敗",
    ],
  ];
  return (
    <section className="monitor-page">
      <PageHeader
        title="配信モニター"
        description="通知がどこまで進んでいるかを、Schedule単位で確認します。"
        actions={
          <div className="monitor-actions">
            <select
              aria-label="表示する配信"
              className="monitor-select"
              value={schedule?.notificationScheduleId ?? ""}
              disabled={!schedule}
              onChange={(event) => setViewId(Number(event.target.value))}
            >
              {!schedule && <option value="">配信なし</option>}
              {state.items.map((entry) => {
                const value = getMonitorSchedule(entry);
                return (
                  <option
                    key={value.notificationScheduleId}
                    value={value.notificationScheduleId}
                  >
                    #{value.notificationId} {value.content.push.title} /
                    Schedule #{value.notificationScheduleId}
                  </option>
                );
              })}
            </select>
            <Button
              disabled={!schedule}
              onClick={() =>
                schedule &&
                state.selectSchedule(schedule.notificationScheduleId)
              }
            >
              詳細を開く
            </Button>
          </div>
        }
      />
      <nav className="monitor-tabs" aria-label="通知管理">
        <ButtonLink to="/notifications">一覧</ButtonLink>
        <span aria-current="page">配信モニター</span>
        <ButtonLink to="/notifications?view=calendar">カレンダー</ButtonLink>
      </nav>
      <div
        className="monitor-view-switch"
        role="group"
        aria-label="モニター表示"
      >
        <Button aria-pressed={!overview} onClick={() => setOverview(false)}>
          選択した配信
        </Button>
        <Button aria-pressed={overview} onClick={() => setOverview(true)}>
          状態別一覧
        </Button>
      </div>
      {overview && state.items.length > 0 && (
        <NotificationMonitorOverview
          items={state.items}
          onOpen={state.selectSchedule}
        />
      )}
      {state.errorMessage && (
        <div
          role="alert"
          className="text-tone-danger-text bg-tone-danger-bg rounded-lg p-4 text-sm"
        >
          {state.errorMessage}
          {state.hasLoaded && " 前回の表示を保持しています。"}
        </div>
      )}
      {!state.hasLoaded && state.isLoading && (
        <p role="status" className="text-text-muted py-12 text-center">
          配信モニターを読み込み中です
        </p>
      )}
      {state.hasLoaded && state.items.length === 0 && (
        <p role="status" className="text-text-muted py-12 text-center">
          表示対象の配信はありません。
        </p>
      )}
      {!overview && schedule && item && (
        <>
          <div className="monitor-metrics">
            {metrics.map(([label, value, caption]) => (
              <div className="monitor-panel monitor-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{caption}</small>
              </div>
            ))}
          </div>
          <div className="monitor-workspace">
            <section className="monitor-panel monitor-flow-panel">
              <header className="monitor-flow-header">
                <div>
                  <h2>
                    Notification #{schedule.notificationId} /{" "}
                    {schedule.content.push.title}
                  </h2>
                  <p>配信予定 {formatNotificationDateTime(schedule.sendAt)}</p>
                </div>
                <span className="monitor-update">
                  <i />
                  30秒ごとに更新
                </span>
              </header>
              {item.errorMessage && (
                <p
                  role="alert"
                  className="text-tone-danger-text bg-tone-danger-bg p-3 text-sm"
                >
                  {item.errorMessage}
                </p>
              )}
              <NotificationMonitorGraph
                item={item}
                onOpen={state.selectSchedule}
              />
            </section>
            <aside className="monitor-sidebar">
              <section className="monitor-panel monitor-side-panel">
                <h2>現在の処理</h2>
                <dl className="monitor-status-list">
                  <div>
                    <dt>表示状態</dt>
                    <dd>
                      <NotificationStatusBadge status={schedule.status} />
                    </dd>
                  </div>
                  <div>
                    <dt>DB status</dt>
                    <dd>{schedule.status}</dd>
                  </div>
                  <div>
                    <dt>Schedule</dt>
                    <dd>#{schedule.notificationScheduleId}</dd>
                  </div>
                  <div>
                    <dt>Recipient確定</dt>
                    <dd>
                      {detail
                        ? detail.recipientProgress.status === "resolved"
                          ? "確定済み"
                          : "未確定"
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>最終更新</dt>
                    <dd>
                      {state.updatedAt === null
                        ? "—"
                        : new Date(state.updatedAt).toLocaleTimeString("ja-JP")}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="monitor-panel monitor-side-panel">
                <h2>Push内訳</h2>
                {delivery ? (
                  <div className="monitor-breakdown">
                    {[
                      {
                        label: "Sent",
                        count: delivery.sentCount,
                        tone: "success",
                      },
                      {
                        label: "Pending",
                        count: delivery.pendingCount,
                        tone: "muted",
                      },
                      {
                        label: "Sending",
                        count: delivery.sendingCount,
                        tone: "active",
                      },
                      {
                        label: "Retry",
                        count: delivery.retryWaitCount,
                        tone: "attention",
                      },
                      {
                        label: "Failed",
                        count: delivery.failedCount,
                        tone: "danger",
                      },
                      {
                        label: "Stopped",
                        count: delivery.stoppedCount,
                        tone: "muted",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className={`monitor-bar-row monitor-bar-${row.tone}`}
                      >
                        <div>
                          <span>
                            {row.label} {row.count.toLocaleString()}
                          </span>
                          <strong>{percent(row.count)}%</strong>
                        </div>
                        <div className="monitor-bar-track">
                          <span style={{ width: `${percent(row.count)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-xs">
                    配信集計を取得できません。
                  </p>
                )}
              </section>
              <section className="monitor-panel monitor-side-panel">
                <h2>配信一覧</h2>
                <div className="monitor-timeline">
                  {[...state.items]
                    .sort(
                      (a, b) =>
                        Date.parse(a.summary.sendAt) -
                        Date.parse(b.summary.sendAt)
                    )
                    .map((entry) => {
                      const value = getMonitorSchedule(entry);
                      return (
                        <button
                          type="button"
                          key={value.notificationScheduleId}
                          aria-pressed={
                            value.notificationScheduleId ===
                            schedule.notificationScheduleId
                          }
                          onClick={() =>
                            setViewId(value.notificationScheduleId)
                          }
                        >
                          <time>
                            {new Date(value.sendAt).toLocaleTimeString(
                              "ja-JP",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </time>
                          <i className={`monitor-dot-${value.status}`} />
                          <span>
                            <strong>{value.content.push.title}</strong>
                            <small>{statusLabels[value.status]}</small>
                          </span>
                        </button>
                      );
                    })}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
      <footer className="monitor-footer">
        <p>
          進行中を含め前後24時間の配信を取得し、配信待ちは次の24時間、処理終了は配信時刻が過去24時間を表示します。FCM受付成功は端末での表示・既読を示しません。
        </p>
        <Button
          icon={RefreshCw}
          disabled={state.isLoading}
          onClick={() => void state.reload()}
        >
          {state.isLoading ? "更新中" : "再読み込み"}
        </Button>
      </footer>
      {state.selectedSchedule && (
        <NotificationMonitorDetail
          item={state.selectedSchedule}
          isLoading={state.isLoading}
          onClose={() => state.selectSchedule(null)}
          onReload={() => void state.reload()}
        />
      )}
    </section>
  );
}
