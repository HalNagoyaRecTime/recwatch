import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-56 flex-1">
          <SearchField
            ariaLabel="対象者を検索"
            placeholder="ユーザー名・User IDを検索"
            value={state.filters.search}
            onValueChange={(search) =>
              state.onFiltersChange({ ...state.filters, search })
            }
          />
        </div>
        <Select
          ariaLabel="送信結果で絞り込み"
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
        <Select
          ariaLabel="送信先で絞り込み"
          value={state.filters.platform}
          onValueChange={(platform) =>
            state.onFiltersChange({ ...state.filters, platform })
          }
          options={[
            { value: "all", label: "すべての送信先" },
            { value: "ios", label: "iOS" },
            { value: "android", label: "Android" },
          ]}
        />
      </div>
      {state.isLoading && (
        <p role="status" className="text-text-muted text-sm">
          配信結果を読み込み中です
        </p>
      )}
      {state.errorMessage && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p className="text-tone-danger-text">{state.errorMessage}</p>
          <Button onClick={() => void state.loadResults()}>再試行</Button>
        </div>
      )}
      {state.data && (
        <>
          <div className="border-border-base bg-surface-base app-rounded overflow-x-auto border">
            <table className="w-full min-w-[650px] border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">ユーザー</th>
                  <th className="px-4 py-3 font-medium">送信結果</th>
                  <th className="px-4 py-3 font-medium">最終送信時間</th>
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {state.items.map((item) => (
                  <RecipientRow
                    key={item.notificationRecipientId}
                    item={item}
                    onOpenDelivery={onOpenDelivery}
                  />
                ))}
              </tbody>
            </table>
            {!state.items.length && (
              <p className="text-text-muted px-4 py-10 text-center text-sm">
                {recipientResolved
                  ? "条件に一致する対象者はいません"
                  : "対象者はまだ確定していません"}
              </p>
            )}
          </div>
          <Pagination
            currentPage={state.page}
            pageCount={state.pageCount}
            pageSize={50}
            totalItems={state.total}
            onPageChange={state.onPageChange}
          />
        </>
      )}
    </div>
  );
}
function RecipientRow({
  item,
  onOpenDelivery,
}: {
  item: Recipient;
  onOpenDelivery: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = getRecipientResult(item);
  const regionId = `recipient-deliveries-${item.notificationRecipientId}`;
  return (
    <>
      <tr>
        <td className="px-4 py-4">
          <button
            type="button"
            aria-label={`${item.user.userName}の送信先`}
            aria-expanded={expanded}
            aria-controls={item.deliveries.length ? regionId : undefined}
            disabled={!item.deliveries.length}
            onClick={() => setExpanded((value) => !value)}
            className="text-text-base flex max-w-full items-center gap-2 text-left enabled:cursor-pointer disabled:cursor-default"
          >
            {expanded ? (
              <ChevronDown className="size-4 shrink-0" />
            ) : (
              <ChevronRight className="size-4 shrink-0" />
            )}
            <span>
              <strong className="block">{item.user.userName}</strong>
              <span className="text-text-muted text-xs">
                User #{item.user.userId}
              </span>
            </span>
          </button>
        </td>
        <td className="px-4 py-4">
          <span
            className={`${resultTones[status]} inline-flex rounded-full px-2 py-1 text-xs font-semibold`}
          >
            {resultLabels[status]}
          </span>
          <p className="text-text-muted mt-1 text-xs">
            {item.deliveries.length}送信先
          </p>
        </td>
        <td className="px-4 py-4">
          {formatNotificationDetailDateTime(lastRecipientAttempt(item))}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={3} className="bg-surface-muted p-3">
            <div
              id={regionId}
              className="border-border-base bg-surface-base app-rounded overflow-hidden border"
            >
              <table className="w-full text-left text-sm">
                <thead className="text-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">送信先</th>
                    <th className="px-3 py-2 font-medium">状態</th>
                    <th className="px-3 py-2 font-medium">試行</th>
                    <th className="px-3 py-2 font-medium">最終送信</th>
                    <th className="px-3 py-2 font-medium">詳細</th>
                  </tr>
                </thead>
                <tbody className="divide-border-subtle divide-y">
                  {item.deliveries.map((delivery) => (
                    <tr key={delivery.notificationPushDeliveryId}>
                      <td className="px-3 py-3">
                        {platformLabel[delivery.platform]}
                        <p className="text-text-muted text-xs">
                          Delivery #{delivery.notificationPushDeliveryId}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        {deliveryStatusLabel[delivery.status]}
                      </td>
                      <td className="px-3 py-3">{delivery.attemptCount}回</td>
                      <td className="px-3 py-3">
                        {formatNotificationDetailDateTime(
                          delivery.sentAt ?? delivery.lastAttemptAt
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          aria-label={`Delivery #${delivery.notificationPushDeliveryId}の詳細`}
                          onClick={() =>
                            onOpenDelivery(delivery.notificationPushDeliveryId)
                          }
                        >
                          詳細
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
