import { NotificationManagementNavigation } from "~/features/notifications/components/NotificationManagementNavigation";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { NotificationMonitorDetail } from "~/features/notifications/components/monitor/NotificationMonitorDetail";
import { NotificationMonitorOverview } from "~/features/notifications/components/monitor/NotificationMonitorOverview";
import { NotificationMonitorGraph } from "~/features/notifications/components/monitor/NotificationMonitorGraph";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import {
  formatNotificationDateTime,
  notificationScheduleStatusLabels,
} from "~/features/notifications/components/list/notification-display";
import type { NotificationFeedbackReporter } from "~/features/notifications/hooks/notification-feedback";
import { useNotificationMonitor } from "~/features/notifications/hooks/useNotificationMonitor";
import { hasMonitorProgress } from "~/features/notifications/hooks/notification-monitor-data";
import "~/features/notifications/components/monitor/notification-monitor.css";

import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";
import { useNotificationMonitorActions } from "~/features/notifications/hooks/useNotificationMonitorActions";
import {
  NotificationMonitorActions,
  NotificationMonitorActionDialog,
} from "~/features/notifications/components/monitor/NotificationMonitorActions";

type Props = {
  commandApi?: NotificationScheduleCommandApi;
  api: NotificationScheduleQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
  now?: () => number;
  refreshIntervalMs?: number;
};

export function NotificationMonitorPage(props: Props) {
  const state = useNotificationMonitor(props);
  const actions = useNotificationMonitorActions({
    ...props,
    items: state.items,
    reload: state.reloadAfterMutation,
  });
  const [overview, setOverview] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const schedule =
    state.items.find(
      (entry) =>
        entry.notificationScheduleId ===
        (actions.target?.schedule.notificationScheduleId ?? viewId)
    ) ??
    state.items.find((entry) => entry.status === "sending") ??
    state.items[0];
  const shownId = schedule?.notificationScheduleId;
  const selectedId = state.selectedSchedule?.notificationScheduleId;
  const shownIds = useMemo(
    () =>
      [
        ...(overview
          ? state.items.map((entry) => entry.notificationScheduleId)
          : [shownId]),
        selectedId,
      ].filter((id) => id !== undefined),
    [overview, state.items, shownId, selectedId]
  );
  const { loadDetails } = state;
  useEffect(() => {
    void loadDetails(shownIds);
  }, [shownIds, loadDetails]);
  const delivery = schedule?.deliveryProgress;
  const percent = (count: number) =>
    delivery && delivery.totalCount > 0
      ? ((count / delivery.totalCount) * 100).toFixed(1)
      : "0.0";
  const metrics = [
    [
      "配信予約の状態",
      schedule ? notificationScheduleStatusLabels[schedule.status] : "—",
      schedule
        ? `記録された状態: ${notificationScheduleStatusLabels[schedule.status]}`
        : "—",
    ],
    [
      "確定した通知対象者",
      schedule?.recipientProgress?.count.toLocaleString() ?? "—",
      schedule?.recipientProgress?.status === "pending"
        ? "利用者ごと・未確定"
        : "利用者ごと",
    ],
    [
      "プッシュ通知の送信先",
      delivery?.totalCount.toLocaleString() ?? "—",
      "通知先端末の登録情報ごと",
    ],
    [
      "通知サービス受付済み",
      delivery?.sentCount.toLocaleString() ?? "—",
      delivery ? `${percent(delivery.sentCount)}%` : "—",
    ],
    [
      "要確認",
      delivery
        ? `再送待ち ${delivery.retryWaitCount} / 失敗 ${delivery.failedCount}`
        : "—",
      "再送待ち / 失敗",
    ],
  ];
  return (
    <section className="monitor-page">
      <PageHeader
        title="配信モニター"
        description="通知がどこまで進んでいるかを、配信予約ごとに確認します。"
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
              {state.items.map((entry) => (
                <option
                  key={entry.notificationScheduleId}
                  value={entry.notificationScheduleId}
                >
                  #{entry.notificationId} {entry.content.push.title} / 配信予約
                  #{entry.notificationScheduleId}
                </option>
              ))}
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
      <NotificationManagementNavigation active="monitor" />
      {props.commandApi && schedule && (
        <NotificationMonitorActions
          schedule={schedule}
          state={actions}
          onSelect={setViewId}
          disabled={state.isLoading}
        />
      )}
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
      {!overview && schedule && (
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
                    通知 #{schedule.notificationId} /{" "}
                    {schedule.content.push.title}
                  </h2>
                  <p>配信予定 {formatNotificationDateTime(schedule.sendAt)}</p>
                </div>
                <span className="monitor-update">
                  <i />
                  30秒ごとに更新
                </span>
              </header>
              {hasMonitorProgress(schedule) ? (
                <NotificationMonitorGraph
                  schedule={schedule}
                  onOpen={state.selectSchedule}
                />
              ) : (
                <p role="status" className="text-text-muted py-12 text-center">
                  集計を読み込んでいます。
                </p>
              )}
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
                    <dt>記録された状態</dt>
                    <dd>{notificationScheduleStatusLabels[schedule.status]}</dd>
                  </div>
                  <div>
                    <dt>配信予約</dt>
                    <dd>#{schedule.notificationScheduleId}</dd>
                  </div>
                  <div>
                    <dt>通知対象者の確定</dt>
                    <dd>
                      {!schedule.recipientProgress
                        ? "—"
                        : schedule.recipientProgress.status === "resolved"
                          ? "確定済み"
                          : "未確定"}
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
                <h2>プッシュ通知の内訳</h2>
                {delivery && (
                  <div className="monitor-breakdown">
                    {[
                      {
                        label: "通知サービス受付済み",
                        count: delivery.sentCount,
                        tone: "success",
                      },
                      {
                        label: "送信待ち",
                        count: delivery.pendingCount,
                        tone: "muted",
                      },
                      {
                        label: "送信中",
                        count: delivery.sendingCount,
                        tone: "active",
                      },
                      {
                        label: "再送待ち",
                        count: delivery.retryWaitCount,
                        tone: "attention",
                      },
                      {
                        label: "失敗",
                        count: delivery.failedCount,
                        tone: "danger",
                      },
                      {
                        label: "停止済み",
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
                )}
              </section>
              <section className="monitor-panel monitor-side-panel">
                <h2>配信一覧</h2>
                <div className="monitor-timeline">
                  {[...state.items]
                    .sort((a, b) => Date.parse(a.sendAt) - Date.parse(b.sendAt))
                    .map((entry) => (
                      <button
                        type="button"
                        key={entry.notificationScheduleId}
                        aria-pressed={
                          entry.notificationScheduleId ===
                          schedule.notificationScheduleId
                        }
                        onClick={() => setViewId(entry.notificationScheduleId)}
                      >
                        <time>
                          {new Date(entry.sendAt).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        <i className={`monitor-dot-${entry.status}`} />
                        <span>
                          <strong>{entry.content.push.title}</strong>
                          <small>
                            {notificationScheduleStatusLabels[entry.status]}
                          </small>
                        </span>
                      </button>
                    ))}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
      <footer className="monitor-footer">
        <p>
          進行中を含め前後24時間の配信を取得し、配信待ちは開始待ちを含め前後24時間、処理終了は配信時刻が過去24時間を表示します。通知サービス受付済みは端末での表示・既読を示しません。
        </p>
        <Button
          icon={RefreshCw}
          disabled={state.isLoading}
          onClick={() => void state.reload()}
        >
          {state.isLoading ? "更新中" : "再読み込み"}
        </Button>
      </footer>
      {actions.target && <NotificationMonitorActionDialog state={actions} />}
      {!actions.target && state.selectedSchedule && (
        <NotificationMonitorDetail
          schedule={state.selectedSchedule}
          actions={
            props.commandApi ? (
              <NotificationMonitorActions
                schedule={state.selectedSchedule}
                state={actions}
                onSelect={setViewId}
                disabled={state.isLoading}
              />
            ) : undefined
          }
          onClose={() => state.selectSchedule(null)}
        />
      )}
    </section>
  );
}
