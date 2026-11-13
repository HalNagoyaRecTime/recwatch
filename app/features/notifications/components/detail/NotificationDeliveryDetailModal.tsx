import { Button } from "~/components/ui/button/Button";
import { FormModal } from "~/components/ui/modal/FormModal";
import type { NotificationPushDeliveryDetail } from "~/features/notifications/api/contracts/notification-push-delivery-api";
import {
  deliveryStatusLabel,
  formatNotificationDeliveryFailure,
  formatNotificationDetailDateTime,
  platformLabel,
} from "~/features/notifications/components/detail/notification-detail-display";

type NotificationDeliveryDetailModalProps = {
  delivery: NotificationPushDeliveryDetail | null;
  errorMessage: string | null;
  isLoading: boolean;
  onClose: () => void;
  onRetry: () => void;
};

export function NotificationDeliveryDetailModal({
  delivery,
  errorMessage,
  isLoading,
  onClose,
  onRetry,
}: NotificationDeliveryDetailModalProps) {
  return (
    <FormModal
      description="通知サービスへの送信の試行状況と現在の状態を表示します"
      onClose={onClose}
      title="プッシュ通知の配信詳細"
    >
      {isLoading ? (
        <p
          aria-live="polite"
          className="text-text-muted py-8 text-center"
          role="status"
        >
          プッシュ通知の配信詳細を読み込み中です
        </p>
      ) : errorMessage ? (
        <div className="flex flex-col items-center gap-3 py-8" role="alert">
          <p className="text-tone-danger-text">{errorMessage}</p>
          <Button onClick={onRetry}>再試行</Button>
        </div>
      ) : delivery ? (
        <dl className="divide-border-subtle border-border-base app-rounded divide-y border text-sm">
          <DetailRow
            label="配信番号"
            value={`#${delivery.notificationPushDeliveryId}`}
          />
          <DetailRow label="送信先" value={platformLabel[delivery.platform]} />
          <DetailRow
            label="状態"
            value={deliveryStatusLabel[delivery.status]}
          />
          <DetailRow label="試行回数" value={`${delivery.attemptCount}回`} />
          <DetailRow
            label="初回試行"
            value={formatNotificationDetailDateTime(delivery.firstAttemptAt)}
          />
          <DetailRow
            label="最終試行"
            value={formatNotificationDetailDateTime(delivery.lastAttemptAt)}
          />
          <DetailRow
            label="次回再送"
            value={formatNotificationDetailDateTime(delivery.nextRetryAt)}
          />
          <DetailRow
            label="通知サービス受付日時"
            value={formatNotificationDetailDateTime(delivery.sentAt)}
          />
          <DetailRow
            label="失敗理由"
            value={formatNotificationDeliveryFailure(delivery.failedReason)}
          />
          <DetailRow
            label="通知サービス受付番号"
            value={delivery.fcmMessageId ?? "—"}
          />
        </dl>
      ) : null}
    </FormModal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 px-4 py-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-base min-w-0 font-medium break-all">{value}</dd>
    </div>
  );
}
