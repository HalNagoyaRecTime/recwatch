import { NotificationScheduleSelector } from "~/features/notifications/components/detail/NotificationScheduleSelector";
import { useNotificationResults } from "~/features/notifications/hooks/useNotificationResults";
import { NotificationResultsPanel } from "~/features/notifications/components/detail/NotificationResultsPanel";
import { NotificationResultSidebar } from "~/features/notifications/components/detail/NotificationResultSidebar";
import { NotificationDeliveryFlow } from "~/features/notifications/components/detail/NotificationDeliveryFlow";
import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import type {
  AdminNotificationDetail,
  AdminNotificationQueryApi,
  NotificationScheduleSummary,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationPushDeliveryApi } from "~/features/notifications/api/contracts/notification-push-delivery-api";
import type {
  NotificationScheduleDetail,
  NotificationScheduleQueryApi,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { NotificationDeliveryDetailModal } from "~/features/notifications/components/detail/NotificationDeliveryDetailModal";
import {
  formatCreation,
  formatStop,
  importanceLabel,
} from "~/features/notifications/components/detail/notification-detail-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { formatNotificationDateTime } from "~/features/notifications/components/list/notification-display";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";
import type { NotificationFeedbackReporter } from "~/features/notifications/hooks/notification-feedback";
import { useNotificationRemoval } from "~/features/notifications/hooks/useNotificationRemoval";
import { DeleteNotificationDialog } from "~/features/notifications/components/list/DeleteNotificationDialog";
import { useNotificationDetail } from "~/features/notifications/hooks/useNotificationDetail";
import { cn } from "~/lib/cn";

type NotificationDetailPageProps = {
  commandApi?: AdminNotificationCommandApi;
  scheduleCommandApi?: NotificationScheduleCommandApi;
  reportFeedback?: NotificationFeedbackReporter;
  notificationId: number;
  pushDeliveryApi: NotificationPushDeliveryApi;
  queryApi: AdminNotificationQueryApi;
  scheduleQueryApi: NotificationScheduleQueryApi;
};

type DetailTab = "overview" | "schedule" | "results";

const tabs = [
  { label: "概要", value: "overview" },
  { label: "配信状況", value: "schedule" },
  { label: "対象者・配信結果", value: "results" },
] as const;

export function NotificationDetailPage({
  commandApi,
  scheduleCommandApi,
  reportFeedback,
  notificationId,
  pushDeliveryApi,
  queryApi,
  scheduleQueryApi,
}: NotificationDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const state = useNotificationDetail({
    notificationId,
    pushDeliveryApi,
    queryApi,
    scheduleQueryApi,
  });
  const navigate = useNavigate();
  const removal = useNotificationRemoval({
    notification: state.notification.data,
    commandApi,
    scheduleCommandApi,
    reportFeedback,
    reload: state.loadNotification,
    onDeleted: () => navigate("/notifications"),
  });
  const selectedSchedule = useMemo(
    () =>
      state.notification.data?.schedules.find(
        (schedule) =>
          schedule.notificationScheduleId === state.selectedScheduleId
      ) ?? null,
    [state.notification.data?.schedules, state.selectedScheduleId]
  );

  const results = useNotificationResults({
    api: scheduleQueryApi,
    scheduleId: state.selectedScheduleId,
    active: tab === "results",
    refreshKey: state.refreshKey,
  });

  const selectSchedule = (id: number) => {
    if (id === state.selectedScheduleId) return;
    results.resetFilters();
    state.selectSchedule(id);
  };

  if (state.notification.isLoading && !state.notification.data) {
    return <PageState role="status" message="通知詳細を読み込み中です" />;
  }

  if (!state.notification.data) {
    return (
      <PageState
        action={
          <Button onClick={() => void state.loadNotification()}>再試行</Button>
        }
        message={state.notification.errorMessage ?? "通知が見つかりません。"}
        role="alert"
      />
    );
  }

  const notification = state.notification.data;

  const selectTab = (nextTab: DetailTab) => {
    setTab(nextTab);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div>
        <Link
          className="text-text-muted hover:text-text-base inline-flex items-center gap-1 text-sm"
          to="/notifications"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          通知一覧
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-text-base text-2xl font-bold">
                {notification.content.detail.title}
              </h1>
              <span className="bg-surface-muted text-text-muted rounded-full px-2.5 py-1 text-xs font-medium">
                重要度: {importanceLabel[notification.importance]}
              </span>
            </div>
            <p className="text-text-muted mt-1 text-sm">
              #{notification.notificationId}・
              {formatCreation(notification.creation)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {removal.canDelete && (
          <Button
            variant="danger"
            disabled={removal.isSubmitting || state.notification.isLoading}
            onClick={() => removal.request({ type: "notification" })}
          >
            通知を削除
          </Button>
        )}
        {selectedSchedule &&
          removal.canCancel(selectedSchedule.notificationScheduleId) &&
          (!state.schedule.data ||
            state.schedule.data.status === "scheduled") && (
            <Button
              variant="secondary"
              disabled={removal.isSubmitting || state.notification.isLoading}
              onClick={() =>
                removal.request({
                  type: "schedule",
                  id: selectedSchedule.notificationScheduleId,
                })
              }
            >
              配信予約をキャンセル
            </Button>
          )}
      </div>
      {removal.errorMessage && (
        <p role="alert" className="text-tone-danger-text">
          {removal.errorMessage}
        </p>
      )}
      {removal.target && (
        <DeleteNotificationDialog
          notification={notification}
          scheduleId={
            removal.target.type === "schedule" ? removal.target.id : undefined
          }
          isSubmitting={removal.isSubmitting}
          onClose={removal.close}
          onConfirm={() => void removal.confirm()}
        />
      )}

      <nav
        aria-label="通知詳細"
        className="border-border-base flex gap-5 border-b"
      >
        {tabs.map((item) => (
          <button
            aria-current={tab === item.value ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-sm font-medium",
              tab === item.value
                ? "border-text-base text-text-base"
                : "text-text-muted hover:text-text-base border-transparent"
            )}
            key={item.value}
            onClick={() => selectTab(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <NotificationScheduleSelector
        schedules={notification.schedules}
        selectedScheduleId={state.selectedScheduleId}
        onSelect={selectSchedule}
      />

      <div
        className={cn(
          "grid items-start gap-4",
          tab === "overview" && "xl:grid-cols-[minmax(0,1fr)_320px]"
        )}
      >
        <div className="min-w-0">
          {tab === "overview" ? (
            <OverviewTab
              notification={notification}
              schedule={selectedSchedule}
            />
          ) : tab === "schedule" ? (
            <ScheduleTab
              detail={state.schedule.data}
              errorMessage={state.schedule.errorMessage}
              refreshError={state.notification.errorMessage}
              isLoading={state.schedule.isLoading}
              isRefreshing={
                state.notification.isLoading || state.schedule.isLoading
              }
              onRetry={() => void state.loadSchedule()}
              onRefresh={() => void state.loadNotification(true)}
              schedule={selectedSchedule}
            />
          ) : (
            <NotificationResultsPanel
              recipientResolved={
                selectedSchedule?.audience.recipientResolution.status ===
                "resolved"
              }
              key={state.selectedScheduleId}
              state={results}
              onOpenDelivery={(id) => void state.openDelivery(id)}
            />
          )}
        </div>
        {tab === "overview" ? (
          <NotificationResultSidebar
            notification={notification}
            selected={selectedSchedule}
          />
        ) : null}
      </div>

      {state.selectedDeliveryId !== null ? (
        <NotificationDeliveryDetailModal
          delivery={state.delivery.data}
          errorMessage={state.delivery.errorMessage}
          isLoading={state.delivery.isLoading}
          onClose={state.closeDelivery}
          onRetry={() => void state.openDelivery(state.selectedDeliveryId!)}
        />
      ) : null}
    </section>
  );
}

function OverviewTab({
  notification,
  schedule,
}: {
  notification: AdminNotificationDetail;
  schedule: NotificationScheduleSummary | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card title="通知内容" description="Mobileへ表示される内容と詳細情報">
        <div className="grid gap-3 md:grid-cols-2">
          <ContentBox
            label="Pushタイトル"
            value={notification.content.push.title}
          />
          <ContentBox label="Push本文" value={notification.content.push.body} />
        </div>
        <ContentBox
          label="通知タイトル"
          value={notification.content.detail.title}
        />
        <ContentBox
          label="通知詳細"
          value={notification.content.detail.body}
          markdown
        />
      </Card>
      <DeliverySummary schedule={schedule} />
    </div>
  );
}

function DeliverySummary({
  schedule,
}: {
  schedule: NotificationScheduleSummary | null;
}) {
  const resolved = schedule?.audience.recipientResolution.status === "resolved";
  const summary = schedule?.recipientPushSummary;
  const recipientCount = (value: number | undefined) =>
    resolved && value !== undefined ? value.toLocaleString() : "未確定";
  const items = [
    [
      "確定した対象者",
      recipientCount(schedule?.audience.recipientResolution.resolvedCount),
      "ユーザー単位",
    ],
    [
      "Push 成功ユーザー",
      recipientCount(summary?.successCount),
      "1 送信先以上で FCM 受付",
    ],
    [
      "Push 未成功ユーザー",
      recipientCount(summary?.failedCount),
      "送信待ち・再送待ちを含む",
    ],
    [
      "送信先なしユーザー",
      recipientCount(summary?.noPushTargetCount),
      "Push 配送記録なし",
    ],
  ];
  return (
    <Card title="配信サマリー" description="対象者単位の配信結果">
      {!schedule ? (
        <p className="text-text-muted text-sm">配信回がありません。</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map(([label, value, description]) => (
            <div
              key={label}
              className="border-border-subtle app-rounded min-w-0 border px-4 py-3"
            >
              <dt className="text-text-muted text-xs">{label}</dt>
              <dd className="text-text-base mt-1 text-2xl font-bold">
                {value}
              </dd>
              <p className="text-text-muted mt-1 text-xs">{description}</p>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

function ScheduleTab({
  detail,
  errorMessage,
  refreshError,
  isLoading,
  isRefreshing,
  onRetry,
  onRefresh,
  schedule,
}: {
  detail: NotificationScheduleDetail | null;
  errorMessage: string | null;
  refreshError: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onRetry: () => void;
  onRefresh: () => void;
  schedule: NotificationScheduleSummary | null;
}) {
  if (isLoading && !detail) return <ScheduleTabSkeleton />;
  if (errorMessage && !detail)
    return (
      <SectionState
        action={<Button onClick={onRetry}>再試行</Button>}
        message={errorMessage}
        role="alert"
      />
    );
  if (!detail || !schedule)
    return <SectionState message="配信状況はありません。" role="status" />;

  const delivery = detail.deliveryProgress;
  const resolved = detail.recipientProgress.status === "resolved";
  const percent = (count: number) =>
    delivery.totalCount > 0
      ? ((count / delivery.totalCount) * 100).toFixed(1)
      : "0.0";
  const breakdown = [
    { label: "Sent", count: delivery.sentCount, tone: "success" },
    { label: "Pending", count: delivery.pendingCount, tone: "muted" },
    { label: "Sending", count: delivery.sendingCount, tone: "active" },
    { label: "Retry", count: delivery.retryWaitCount, tone: "attention" },
    { label: "Failed", count: delivery.failedCount, tone: "danger" },
    { label: "Stopped", count: delivery.stoppedCount, tone: "muted" },
  ];

  return (
    <div className="space-y-4">
      {(errorMessage || refreshError) && (
        <div role="alert" className="text-tone-danger-text text-sm">
          最新の配信状況を取得できませんでした。前回の表示を保持しています。
          <Button onClick={onRefresh}>再試行</Button>
        </div>
      )}
      <div className="monitor-workspace">
        <section className="monitor-panel monitor-flow-panel">
          <header className="monitor-flow-header">
            <div>
              <h2>
                Notification #{detail.notificationId} /{" "}
                {detail.content.push.title}
              </h2>
              <p>配信予定 {formatNotificationDateTime(detail.sendAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                aria-label="配信状況を更新"
                disabled={isRefreshing}
                icon={RefreshCw}
                onClick={onRefresh}
                size="sm"
              >
                {isRefreshing ? "更新中" : "更新"}
              </Button>
            </div>
          </header>
          <NotificationDeliveryFlow detail={detail} />
        </section>
        <aside className="monitor-sidebar">
          <section className="monitor-panel monitor-side-panel">
            <h2>現在の処理</h2>
            <dl className="monitor-status-list">
              <div>
                <dt>表示状態</dt>
                <dd>
                  <NotificationStatusBadge status={detail.status} />
                </dd>
              </div>
              <div>
                <dt>DB status</dt>
                <dd>{detail.status}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>#{detail.notificationScheduleId}</dd>
              </div>
              <div>
                <dt>Recipient確定</dt>
                <dd>{resolved ? "確定済み" : "未確定"}</dd>
              </div>
              <div>
                <dt>停止情報</dt>
                <dd>{detail.stop ? formatStop(detail.stop) : "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="monitor-panel monitor-side-panel">
            <h2>Push内訳</h2>
            <div className="monitor-breakdown">
              {breakdown.map((row) => (
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
          </section>
        </aside>
      </div>
    </div>
  );
}

function ScheduleTabSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="配信状況を読み込み中です"
      className="space-y-4"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-surface-muted h-9 w-20 animate-pulse rounded" />
        <div className="bg-surface-muted h-9 w-32 animate-pulse rounded" />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="border-border-base bg-surface-base app-rounded h-[620px] animate-pulse border" />
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="border-border-base bg-surface-base app-rounded h-40 animate-pulse border"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="border-border-base bg-surface-base app-rounded border">
      <header className="border-border-subtle border-b px-5 py-4">
        <h2 className="text-text-base font-semibold">{title}</h2>
        {description ? (
          <p className="text-text-muted mt-0.5 text-xs">{description}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-3 p-5">{children}</div>
    </section>
  );
}

function ContentBox({
  label,
  value,
  markdown = false,
}: {
  label: string;
  value: string;
  markdown?: boolean;
}) {
  return (
    <div className="border-border-subtle bg-surface-muted app-rounded border px-4 py-3">
      <p className="text-text-muted text-xs">{label}</p>
      <div className="text-text-base mt-1 font-medium whitespace-pre-wrap">
        {markdown ? <MarkdownContent content={value} /> : value}
      </div>
    </div>
  );
}

function PageState({
  action,
  message,
  role,
}: {
  action?: React.ReactNode;
  message: string;
  role: "alert" | "status";
}) {
  return (
    <div
      className="border-border-base app-rounded flex min-h-80 flex-col items-center justify-center gap-4 border px-5 text-center"
      role={role}
    >
      <p
        className={
          role === "alert" ? "text-tone-danger-text" : "text-text-muted"
        }
      >
        {message}
      </p>
      {action}
      <Link
        className="text-brand-primary text-sm hover:underline"
        to="/notifications"
      >
        通知一覧へ戻る
      </Link>
    </div>
  );
}

function SectionState({
  action,
  message,
  role,
}: {
  action?: React.ReactNode;
  message: string;
  role: "alert" | "status";
}) {
  return (
    <div
      className="border-border-base app-rounded flex min-h-52 flex-col items-center justify-center gap-3 border px-5 text-center"
      role={role}
    >
      <p
        className={
          role === "alert" ? "text-tone-danger-text" : "text-text-muted"
        }
      >
        {message}
      </p>
      {action}
    </div>
  );
}
