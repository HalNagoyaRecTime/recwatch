import { NotificationScheduleSelector } from "~/features/notifications/components/detail/NotificationScheduleSelector";
import { useNotificationResults } from "~/features/notifications/hooks/useNotificationResults";
import { NotificationResultsPanel } from "~/features/notifications/components/detail/NotificationResultsPanel";
import { NotificationResultSidebar } from "~/features/notifications/components/detail/NotificationResultSidebar";
import { NotificationDeliveryFlow } from "~/features/notifications/components/detail/NotificationDeliveryFlow";
import {
  NotificationMonitorActions,
  NotificationMonitorActionDialog,
} from "~/features/notifications/components/monitor/NotificationMonitorActions";
import { useNotificationMonitorActions } from "~/features/notifications/hooks/useNotificationMonitorActions";
import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";
import { ChevronLeft } from "lucide-react";
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

  const monitorActions = useNotificationMonitorActions({
    commandApi: scheduleCommandApi,
    items: state.schedule.data
      ? [
          {
            summary: state.schedule.data,
            detail: state.schedule.data,
            errorMessage: null,
          },
        ]
      : [],
    reload: state.loadNotification,
    reportFeedback,
  });

  const selectSchedule = (id: number) => {
    if (id === state.selectedScheduleId) return;
    monitorActions.close();
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

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {tab === "overview" ? (
            <OverviewTab
              notification={notification}
              schedule={selectedSchedule}
              detail={state.schedule.data}
              isLoading={state.schedule.isLoading}
              errorMessage={state.schedule.errorMessage}
            />
          ) : tab === "schedule" ? (
            <ScheduleTab
              detail={state.schedule.data}
              errorMessage={state.schedule.errorMessage}
              refreshError={state.notification.errorMessage}
              isLoading={state.schedule.isLoading}
              onRetry={() => void state.loadSchedule()}
              onRefresh={() => void state.loadNotification(true)}
              onShowResults={() => selectTab("results")}
              actions={
                state.schedule.data && scheduleCommandApi ? (
                  <NotificationMonitorActions
                    schedule={state.schedule.data}
                    state={monitorActions}
                    allowedActions={["resend", "stop"]}
                    disabled={
                      state.notification.isLoading ||
                      state.schedule.isLoading ||
                      Boolean(
                        state.schedule.errorMessage ||
                        state.notification.errorMessage
                      )
                    }
                  />
                ) : null
              }
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
        <NotificationResultSidebar
          notification={notification}
          selected={selectedSchedule}
          scheduleDetail={state.schedule.data}
          scheduleLoading={state.schedule.isLoading}
          scheduleError={state.schedule.errorMessage}
          onSelect={selectSchedule}
          onRetrySchedule={() => void state.loadSchedule()}
        />
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
      <NotificationMonitorActionDialog state={monitorActions} />
    </section>
  );
}

function OverviewTab({
  notification,
  schedule,
  detail,
  isLoading,
  errorMessage,
}: {
  notification: AdminNotificationDetail;
  schedule: NotificationScheduleSummary | null;
  detail: NotificationScheduleDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card
        title="通知内容"
        description="スマートフォンのアプリに表示される内容と詳細情報"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ContentBox
            label="プッシュ通知のタイトル"
            value={notification.content.push.title}
          />
          <ContentBox
            label="プッシュ通知の本文"
            value={notification.content.push.body}
          />
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
      <DeliverySummary
        schedule={schedule}
        detail={detail}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </div>
  );
}

function DeliverySummary({
  schedule,
  detail,
  isLoading,
  errorMessage,
}: {
  schedule: NotificationScheduleSummary | null;
  detail: NotificationScheduleDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
}) {
  const resolved = schedule?.audience.recipientResolution.status === "resolved";
  const summary = schedule?.recipientPushSummary;
  const delivery =
    !isLoading &&
    !errorMessage &&
    detail?.notificationScheduleId === schedule?.notificationScheduleId
      ? detail?.deliveryProgress
      : null;
  const recipientCount = (value: number | undefined) =>
    resolved && value !== undefined ? value.toLocaleString() : "未確定";
  const deliveryCount = (value: number | undefined) =>
    value === undefined ? "—" : value.toLocaleString();
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
    ["Push 送信先", deliveryCount(delivery?.totalCount), "送信先単位"],
    ["FCM 受付成功", deliveryCount(delivery?.sentCount), "送信先単位"],
    ["送信失敗", deliveryCount(delivery?.failedCount), "送信先単位"],
    ["再送待ち", deliveryCount(delivery?.retryWaitCount), "送信先単位"],
  ];
  return (
    <Card
      title="配信サマリー"
      description="ユーザー単位と Push 送信先単位を分けて表示"
    >
      {!schedule ? (
        <p className="text-text-muted text-sm">配信回がありません。</p>
      ) : (
        <>
          {isLoading ? (
            <p className="text-text-muted text-xs" role="status">
              送信先の集計を読み込み中です
            </p>
          ) : errorMessage ? (
            <p className="text-tone-danger-text text-xs">
              送信先の集計を取得できませんでした。右側から再試行できます。
            </p>
          ) : null}
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
        </>
      )}
    </Card>
  );
}

function ScheduleTab({
  detail,
  errorMessage,
  refreshError,
  isLoading,
  onRetry,
  onRefresh,
  onShowResults,
  actions,
  schedule,
}: {
  detail: NotificationScheduleDetail | null;
  errorMessage: string | null;
  refreshError: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onRefresh: () => void;
  onShowResults: () => void;
  actions: React.ReactNode;
  schedule: NotificationScheduleSummary | null;
}) {
  if (isLoading && !detail)
    return <SectionState message="配信状況を読み込み中です" role="status" />;
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

  return (
    <div className="space-y-4">
      {(errorMessage || refreshError) && (
        <div role="alert" className="text-tone-danger-text text-sm">
          最新の配信状況を取得できませんでした。前回の表示を保持しています。
          <Button onClick={onRefresh}>再試行</Button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>{actions}</div>
        <Button onClick={onRefresh}>配信状況を更新</Button>
      </div>
      <Card title="配信の流れ" description="選択した配信回の処理状況">
        <NotificationDeliveryFlow detail={detail} />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="処理状況">
          <div className="mb-4">
            <NotificationStatusBadge status={detail.status} />
          </div>
          <Definition
            label="配信対象の確認"
            value={`${detail.audienceProgress.resolvedCount} / ${detail.audienceProgress.totalCount}`}
          />
          <Definition
            label="通知対象者の確定"
            value={
              detail.recipientProgress.status === "resolved"
                ? `${detail.recipientProgress.count.toLocaleString()}件・確定済み`
                : `${detail.recipientProgress.count.toLocaleString()}件・確定待ち`
            }
          />
          <Definition label="停止情報" value={formatStop(detail.stop)} />
        </Card>
        <Card
          title="プッシュ通知の配信集計"
          description="通知先端末の登録情報ごとの集計です。通知対象者数とは一致しない場合があります"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="総配信件数"
              value={detail.deliveryProgress.totalCount}
            />
            <Metric
              label="通知サービス受付済み"
              value={detail.deliveryProgress.sentCount}
            />
            <Metric
              label="再送待ち"
              value={detail.deliveryProgress.retryWaitCount}
            />
            <Metric label="失敗" value={detail.deliveryProgress.failedCount} />
            <Metric
              label="送信待ち"
              value={detail.deliveryProgress.pendingCount}
            />
            <Metric
              label="送信中"
              value={detail.deliveryProgress.sendingCount}
            />
            <Metric label="停止" value={detail.deliveryProgress.stoppedCount} />
          </div>
        </Card>
      </div>
      <Card title="送信先の内訳" description="送信先総数に対する割合">
        <div className="space-y-3">
          {(
            [
              [
                "FCM受付成功",
                detail.deliveryProgress.sentCount,
                "bg-tone-success-text",
              ],
              [
                "送信待ち",
                detail.deliveryProgress.pendingCount,
                "bg-text-muted",
              ],
              [
                "送信中",
                detail.deliveryProgress.sendingCount,
                "bg-brand-primary",
              ],
              [
                "再送待ち",
                detail.deliveryProgress.retryWaitCount,
                "bg-text-muted",
              ],
              [
                "失敗",
                detail.deliveryProgress.failedCount,
                "bg-tone-danger-text",
              ],
              ["停止", detail.deliveryProgress.stoppedCount, "bg-text-muted"],
            ] as const
          ).map(([label, count, color]) => {
            const total = detail.deliveryProgress.totalCount;
            const percent =
              total > 0 ? Math.min(100, (count / total) * 100) : null;
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span>
                    {label} {count.toLocaleString()}件
                  </span>
                  <span className="text-text-muted">
                    {percent === null ? "—" : `${percent.toFixed(1)}%`}
                  </span>
                </div>
                <div
                  className="bg-surface-muted h-2 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <div
                    className={`${color} h-full rounded-full`}
                    style={{ width: `${percent ?? 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <p className="text-text-muted text-xs">
        FCM受付成功は端末での通知表示や既読を示しません。
      </p>
      <Button onClick={onShowResults}>対象者・配信結果を見る</Button>
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

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border-subtle grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b pb-3 text-sm last:border-0 last:pb-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-base min-w-0 text-right font-medium break-words">
        {value}
      </dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border-subtle app-rounded border px-4 py-3">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="text-text-base mt-1 text-2xl font-bold">
        {value.toLocaleString()}
      </p>
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
