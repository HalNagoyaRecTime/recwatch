import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
} from "~/components/ui/data-table/DataTable";
import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { Select } from "~/components/ui/form/Select";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type { NotificationScheduleResults } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import type { useNotificationResults } from "~/features/notifications/hooks/useNotificationResults";
import {
  getRecipientResult,
  lastRecipientAttempt,
  type ResultStatus,
} from "~/features/notifications/model/notification-results";
import {
  deliveryStatusLabel,
  platformLabel,
  formatNotificationDetailDateTime,
} from "~/features/notifications/components/detail/notification-detail-display";

type Recipient = NotificationScheduleResults["recipients"]["items"][number];
const resultLabels: Record<ResultStatus, string> = {
  success: "成功",
  partial: "一部失敗",
  failed: "失敗",
  processing: "処理中",
  stopped: "停止",
  no_target: "送信先なし",
};
const resultTones: Record<ResultStatus, string> = {
  success: "bg-tone-success-bg text-tone-success-text",
  partial: "bg-surface-muted text-text-base",
  failed: "bg-tone-danger-bg text-tone-danger-text",
  processing: "bg-surface-muted text-brand-primary",
  stopped: "bg-surface-muted text-text-muted",
  no_target: "bg-surface-muted text-text-muted",
};
export function NotificationResultsPanel({
  state,
  onOpenDelivery,
  recipientResolved,
}: {
  recipientResolved: boolean;
  state: ReturnType<typeof useNotificationResults>;
  onOpenDelivery: (id: number) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const columns: DataTableColumn<Recipient>[] = [
    {
      id: "user",
      header: "ユーザー",
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (item) => (
        <button
          type="button"
          aria-label={`${item.user.userName}の送信先`}
          aria-expanded={expandedIds.has(item.notificationRecipientId)}
          aria-controls={
            item.deliveries.length
              ? `recipient-deliveries-${item.notificationRecipientId}`
              : undefined
          }
          disabled={!item.deliveries.length}
          onClick={() =>
            setExpandedIds((current) => {
              const next = new Set(current);
              if (next.has(item.notificationRecipientId))
                next.delete(item.notificationRecipientId);
              else next.add(item.notificationRecipientId);
              return next;
            })
          }
          className="text-text-base flex max-w-full items-center gap-2 text-left enabled:cursor-pointer disabled:cursor-default"
        >
          {expandedIds.has(item.notificationRecipientId) ? (
            <ChevronDown className="size-4 shrink-0" />
          ) : (
            <ChevronRight className="size-4 shrink-0" />
          )}
          <span className="min-w-0">
            <strong className="block truncate">{item.user.userName}</strong>
            <span className="text-text-muted text-xs">
              User #{item.user.userId}
            </span>
          </span>
        </button>
      ),
    },
    {
      id: "status",
      header: "送信結果",
      width: { type: "fluid", min: 130 },
      renderCell: (item) => (
        <>
          <span
            className={`${resultTones[getRecipientResult(item)]} inline-flex rounded-full px-2 py-0.5 text-xs font-semibold`}
          >
            {resultLabels[getRecipientResult(item)]}
          </span>
          <span className="text-text-muted ml-2 text-xs">
            {item.deliveries.length}送信先
          </span>
        </>
      ),
    },
    {
      id: "lastAttempt",
      header: "最終送信・試行時間",
      width: { type: "fluid", min: 180 },
      renderCell: (item) =>
        formatNotificationDetailDateTime(lastRecipientAttempt(item)),
    },
  ];
  return (
    <section aria-label="対象者・配信結果" className="min-w-0 space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-56 flex-1">
            <SearchField
              ariaLabel="対象者を検索"
              placeholder="ユーザー名・User IDを検索"
              disabled
              value={state.filters.search}
              onValueChange={(search) =>
                state.onFiltersChange({ ...state.filters, search })
              }
            />
          </div>
          <Select
            ariaLabel="送信結果で絞り込み"
            disabled
            value={state.filters.status}
            onValueChange={(status) =>
              state.onFiltersChange({ ...state.filters, status })
            }
            options={[
              { value: "all", label: "すべての送信結果" },
              ...Object.entries(resultLabels).map(([value, label]) => ({
                value: value as ResultStatus,
                label,
              })),
            ]}
          />
        </div>
        <p className="text-text-muted text-xs">
          検索・絞り込みは今後対応予定です。
        </p>
      </div>
      {state.isLoading && (
        <p role="status" className="text-text-muted px-4 py-3 text-sm">
          配信結果を読み込み中です
        </p>
      )}
      {state.errorMessage && (
        <div role="alert" className="flex items-center gap-3 p-4 text-sm">
          <p className="text-tone-danger-text">{state.errorMessage}</p>
          <Button onClick={() => void state.loadResults()}>再試行</Button>
        </div>
      )}
      {state.data && (
        <>
          <DataTable
            ariaLabel="対象者一覧"
            columns={columns}
            items={state.items}
            getRowKey={(item) => item.notificationRecipientId}
            emptyMessage={
              recipientResolved
                ? "配信対象者はいません"
                : "対象者はまだ確定していません"
            }
            footer={
              <Pagination
                currentPage={state.page}
                pageCount={state.pageCount}
                pageSize={50}
                totalItems={state.total}
                onPageChange={state.onPageChange}
              />
            }
            renderExpandedRow={(item) =>
              expandedIds.has(item.notificationRecipientId) ? (
                <RecipientDeliveries
                  item={item}
                  onOpenDelivery={onOpenDelivery}
                />
              ) : null
            }
          />
        </>
      )}
    </section>
  );
}
function RecipientDeliveries({
  item,
  onOpenDelivery,
}: {
  item: Recipient;
  onOpenDelivery: (id: number) => void;
}) {
  const regionId = `recipient-deliveries-${item.notificationRecipientId}`;
  type Delivery = Recipient["deliveries"][number];
  const columns: DataTableColumn<Delivery>[] = [
    {
      id: "platform",
      header: "送信先",
      width: { type: "fluid", min: 120 },
      renderCell: (delivery) => (
        <>
          {platformLabel[delivery.platform]}
          <p className="text-text-muted text-xs">
            Delivery #{delivery.notificationPushDeliveryId}
          </p>
        </>
      ),
    },
    {
      id: "status",
      header: "状態",
      width: { type: "fluid", min: 125 },
      renderCell: (delivery) => deliveryStatusLabel[delivery.status],
    },
    {
      id: "attempts",
      header: "試行",
      width: { type: "fixed", value: 70 },
      renderCell: (delivery) => `${delivery.attemptCount}回`,
    },
    {
      id: "lastAttempt",
      header: "最終送信・試行",
      width: { type: "fluid", min: 170 },
      renderCell: (delivery) =>
        formatNotificationDetailDateTime(
          delivery.lastAttemptAt ?? delivery.sentAt
        ),
    },
    {
      id: "detail",
      header: "詳細",
      width: { type: "fixed", value: 100 },
      renderCell: (delivery) => (
        <Button
          size="sm"
          aria-label={`Delivery #${delivery.notificationPushDeliveryId}の詳細`}
          onClick={() => onOpenDelivery(delivery.notificationPushDeliveryId)}
        >
          詳細
        </Button>
      ),
    },
  ];
  return (
    <div role="row" className="bg-surface-muted p-3">
      <div role="cell" id={regionId}>
        <DataTable
          ariaLabel={`${item.user.userName}の送信先一覧`}
          columns={columns}
          items={item.deliveries}
          getRowKey={(delivery) => delivery.notificationPushDeliveryId}
        />
      </div>
    </div>
  );
}
