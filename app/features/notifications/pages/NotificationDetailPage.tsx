import { ChevronLeft, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type {
  AdminNotificationDetail,
  AdminNotificationQueryApi,
  NotificationScheduleSummary,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationPushDeliveryApi } from "~/features/notifications/api/contracts/notification-push-delivery-api";
import type {
  NotificationResultDelivery,
  NotificationScheduleDetail,
  NotificationScheduleQueryApi,
  NotificationScheduleResults,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { NotificationDeliveryDetailModal } from "~/features/notifications/components/detail/NotificationDeliveryDetailModal";
import {
  deliveryStatusLabel,
  formatCreation,
  formatNotificationDetailDateTime,
  formatStop,
  importanceLabel,
  platformLabel,
  scheduleStatusLabel,
} from "~/features/notifications/components/detail/notification-detail-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { useNotificationDetail } from "~/features/notifications/hooks/useNotificationDetail";
import { cn } from "~/lib/cn";

type NotificationDetailPageProps = {
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
  notificationId,
  pushDeliveryApi,
  queryApi,
  scheduleQueryApi,
}: NotificationDetailPageProps) {
  const state = useNotificationDetail({
    notificationId,
    pushDeliveryApi,
    queryApi,
    scheduleQueryApi,
  });
  const [tab, setTab] = useState<DetailTab>("overview");
  const selectedSchedule = useMemo(
    () =>
      state.notification.data?.schedules.find(
        (schedule) =>
          schedule.notificationScheduleId === state.selectedScheduleId
      ) ?? null,
    [state.notification.data?.schedules, state.selectedScheduleId]
  );

  const loadResults = state.loadResults;
  const selectedScheduleId = state.selectedScheduleId;

  useEffect(() => {
    if (tab === "results" && selectedScheduleId !== null) {
      void loadResults();
    }
  }, [loadResults, selectedScheduleId, tab]);

  if (state.notification.isLoading && !state.notification.data) {
    return <PageState role="status" message="通知詳細を読み込み中です" />;
  }

  if (state.notification.errorMessage || !state.notification.data) {
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
          <Button
            aria-label="通知詳細を再読み込み"
            icon={RefreshCw}
            iconOnly
            onClick={() => void state.loadNotification()}
          />
        </div>
      </div>

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

      <ScheduleSelector
        schedules={notification.schedules}
        selectedScheduleId={state.selectedScheduleId}
        onSelect={state.selectSchedule}
      />

      {tab === "overview" ? (
        <OverviewTab notification={notification} schedule={selectedSchedule} />
      ) : tab === "schedule" ? (
        <ScheduleTab
          detail={state.schedule.data}
          errorMessage={state.schedule.errorMessage}
          isLoading={state.schedule.isLoading}
          onRetry={() => void state.loadSchedule()}
          schedule={selectedSchedule}
        />
      ) : (
        <ResultsTab
          errorMessage={state.results.errorMessage}
          isLoading={state.results.isLoading}
          onOpenDelivery={(id) => void state.openDelivery(id)}
          onPageChange={(page) => void state.loadResults(page)}
          onRetry={() => void state.loadResults()}
          results={state.results.data}
        />
      )}

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

function ScheduleSelector({
  onSelect,
  schedules,
  selectedScheduleId,
}: {
  onSelect: (scheduleId: number) => void;
  schedules: NotificationScheduleSummary[];
  selectedScheduleId: number | null;
}) {
  if (schedules.length === 0) {
    return (
      <div className="border-border-base app-rounded border px-5 py-4 text-sm">
        <p className="text-text-muted">Scheduleはまだありません。</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Schedule一覧">
      {schedules.map((schedule, index) => (
        <button
          aria-pressed={schedule.notificationScheduleId === selectedScheduleId}
          className={cn(
            "app-rounded min-w-56 border px-4 py-3 text-left transition-colors",
            schedule.notificationScheduleId === selectedScheduleId
              ? "border-brand-primary bg-surface-muted"
              : "border-border-base bg-surface-base hover:bg-surface-hover"
          )}
          key={schedule.notificationScheduleId}
          onClick={() => onSelect(schedule.notificationScheduleId)}
          type="button"
        >
          <span className="text-text-muted text-xs">{index + 1}回目</span>
          <span className="text-text-base mt-1 block font-semibold">
            {formatNotificationDetailDateTime(schedule.sendAt)}
          </span>
          <span className="text-text-muted mt-1 block text-xs">
            Schedule #{schedule.notificationScheduleId}・
            {scheduleStatusLabel[schedule.status]}
          </span>
        </button>
      ))}
    </div>
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Card title="通知内容" description="Mobileへ表示される内容と詳細情報">
          <div className="grid gap-3 md:grid-cols-2">
            <ContentBox
              label="Pushタイトル"
              value={notification.content.push.title}
            />
            <ContentBox
              label="Push本文"
              value={notification.content.push.body}
            />
          </div>
          <ContentBox
            label="通知詳細"
            value={`${notification.content.detail.title}\n\n${notification.content.detail.body}`}
          />
        </Card>
        {schedule ? <RecipientSummary schedule={schedule} /> : null}
      </div>
      <div className="flex flex-col gap-4">
        {schedule ? (
          <Card title="Schedule">
            <Definition
              label="Schedule ID"
              value={`#${schedule.notificationScheduleId}`}
            />
            <Definition
              label="配信予定"
              value={formatNotificationDetailDateTime(schedule.sendAt)}
            />
            <Definition
              label="状態"
              value={scheduleStatusLabel[schedule.status]}
            />
            <Definition
              label="予約者"
              value={
                schedule.scheduledBy?.userName ?? "不明（削除済みの可能性あり）"
              }
            />
            <Definition
              label="Audience確定"
              value={`${schedule.audience.recipientResolution.resolvedCount}件・${schedule.audience.recipientResolution.status === "resolved" ? "確定済み" : "確定待ち"}`}
            />
            <Definition
              label="作成日時"
              value={formatNotificationDetailDateTime(schedule.createdAt)}
            />
            <Definition label="停止" value={formatStop(schedule.stop)} />
          </Card>
        ) : null}
        <Card title="通知情報">
          <Definition
            label="作成"
            value={formatCreation(notification.creation)}
          />
          <Definition
            label="作成日時"
            value={formatNotificationDetailDateTime(notification.createdAt)}
          />
          <Definition
            label="更新日時"
            value={formatNotificationDetailDateTime(notification.updatedAt)}
          />
        </Card>
      </div>
    </div>
  );
}

function RecipientSummary({
  schedule,
}: {
  schedule: NotificationScheduleSummary;
}) {
  const summary = schedule.recipientPushSummary;
  return (
    <Card
      title="Recipient集計"
      description="Recipient単位。Push配送数とは別の集計です"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="対象Recipient" value={summary.totalCount} />
        <Metric label="成功Recipient" value={summary.successCount} />
        <Metric label="失敗Recipient" value={summary.failedCount} />
        <Metric label="Push対象なし" value={summary.noPushTargetCount} />
      </div>
      <div className="border-border-subtle mt-4 border-t pt-4">
        <p className="text-text-muted mb-2 text-xs font-medium">Audience</p>
        <div className="flex flex-wrap gap-2">
          {schedule.audience.items.map((item, index) => (
            <span
              className="bg-surface-muted text-text-base rounded-full px-3 py-1 text-sm"
              key={`${item.type}-${"targetId" in item ? item.targetId : index}`}
            >
              {formatAudience(item)}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ScheduleTab({
  detail,
  errorMessage,
  isLoading,
  onRetry,
  schedule,
}: {
  detail: NotificationScheduleDetail | null;
  errorMessage: string | null;
  isLoading: boolean;
  onRetry: () => void;
  schedule: NotificationScheduleSummary | null;
}) {
  if (isLoading)
    return <SectionState message="配信状況を読み込み中です" role="status" />;
  if (errorMessage)
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
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="処理状況">
        <div className="mb-4">
          <NotificationStatusBadge status={schedule.status} />
        </div>
        <Definition
          label="Audience解決"
          value={`${detail.audienceProgress.resolvedCount} / ${detail.audienceProgress.totalCount}`}
        />
        <Definition
          label="Recipient確定"
          value={`${detail.recipientProgress.count}件・${detail.recipientProgress.status === "resolved" ? "確定済み" : "確定待ち"}`}
        />
        <Definition label="停止情報" value={formatStop(detail.stop)} />
      </Card>
      <Card
        title="Push配送集計"
        description="Token単位。Recipient集計とは一致しない場合があります"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="全配送" value={detail.deliveryProgress.totalCount} />
          <Metric
            label="FCM受付成功"
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
          <Metric label="送信中" value={detail.deliveryProgress.sendingCount} />
          <Metric label="停止" value={detail.deliveryProgress.stoppedCount} />
        </div>
      </Card>
    </div>
  );
}

function ResultsTab({
  errorMessage,
  isLoading,
  onOpenDelivery,
  onPageChange,
  onRetry,
  results,
}: {
  errorMessage: string | null;
  isLoading: boolean;
  onOpenDelivery: (deliveryId: number) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  results: NotificationScheduleResults | null;
}) {
  if (isLoading && !results)
    return <SectionState message="配信結果を読み込み中です" role="status" />;
  if (errorMessage && !results) {
    return (
      <SectionState
        action={<Button onClick={onRetry}>再試行</Button>}
        message={errorMessage}
        role="alert"
      />
    );
  }
  if (!results) return null;

  const pagination = results.recipients.pagination;
  return (
    <Card
      title="対象者・配信結果"
      description="このScheduleのResultsだけを取得して表示しています"
    >
      {errorMessage ? (
        <p className="text-tone-danger-text mb-3 text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="border-border-base app-rounded overflow-x-auto border">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Recipient ID</th>
              <th className="px-4 py-3 font-medium">Push配送</th>
            </tr>
          </thead>
          <tbody className="divide-border-subtle divide-y">
            {results.recipients.items.map((recipient) => (
              <tr key={recipient.notificationRecipientId}>
                <td className="px-4 py-3">
                  <strong className="text-text-base block">
                    {recipient.user.userName}
                  </strong>
                  <span className="text-text-muted text-xs">
                    User #{recipient.user.userId}
                  </span>
                </td>
                <td className="text-text-muted px-4 py-3">
                  #{recipient.notificationRecipientId}
                </td>
                <td className="px-4 py-3">
                  {recipient.deliveries.length === 0 ? (
                    <span className="text-text-muted">Tokenなし</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {recipient.deliveries.map((delivery) => (
                        <DeliveryButton
                          delivery={delivery}
                          key={delivery.notificationPushDeliveryId}
                          onClick={onOpenDelivery}
                        />
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 ? (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            onPageChange={onPageChange}
            pageCount={pagination.totalPages}
            pageSize={pagination.limit}
            totalItems={pagination.totalCount}
          />
        </div>
      ) : null}
    </Card>
  );
}

function DeliveryButton({
  delivery,
  onClick,
}: {
  delivery: NotificationResultDelivery;
  onClick: (id: number) => void;
}) {
  return (
    <button
      aria-label={`Delivery #${delivery.notificationPushDeliveryId}の詳細`}
      className="border-border-base hover:bg-surface-hover app-rounded border px-3 py-2 text-left"
      onClick={() => onClick(delivery.notificationPushDeliveryId)}
      type="button"
    >
      <span className="text-text-base block text-xs font-semibold">
        {platformLabel[delivery.platform]}・
        {deliveryStatusLabel[delivery.status]}
      </span>
      <span className="text-text-muted mt-0.5 block text-xs">
        #{delivery.notificationPushDeliveryId}・{delivery.attemptCount}回試行
      </span>
    </button>
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

function ContentBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border-subtle bg-surface-muted app-rounded border px-4 py-3">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="text-text-base mt-1 font-medium whitespace-pre-wrap">
        {value}
      </p>
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

function formatAudience(
  item: NotificationScheduleSummary["audience"]["items"][number]
) {
  if (item.type === "all") return "全員";
  const type = {
    class_room: "クラス",
    gathering: "集合",
    event: "イベント",
    user: "個人",
  }[item.type];
  return `${type}: ${item.label ?? "削除済み"}`;
}
