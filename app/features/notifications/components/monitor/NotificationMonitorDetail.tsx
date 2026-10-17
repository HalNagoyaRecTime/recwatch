import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { FormModal } from "~/components/ui/modal/FormModal";
import {
  formatCreation,
  formatStop,
} from "~/features/notifications/components/detail/notification-detail-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { formatNotificationDateTime } from "~/features/notifications/components/list/notification-display";
import { NotificationMonitorProgress } from "~/features/notifications/components/monitor/NotificationMonitorProgress";
import {
  getMonitorSchedule,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";

export function NotificationMonitorDetail({
  item,
  isLoading,
  onClose,
  onReload,
}: {
  item: MonitorSchedule;
  isLoading: boolean;
  onClose: () => void;
  onReload: () => void;
}) {
  const schedule = getMonitorSchedule(item);
  return (
    <FormModal title="配信詳細" onClose={onClose}>
      <div className="space-y-4">
        <NotificationStatusBadge status={schedule.status} />
        <h2 className="text-text-base text-lg font-semibold break-words">
          {schedule.content.push.title}
        </h2>
        <p className="text-text-muted text-sm">
          Schedule #{schedule.notificationScheduleId}・
          {formatNotificationDateTime(schedule.sendAt)}
        </p>
        <p className="text-text-base text-sm break-words whitespace-pre-wrap">
          {schedule.content.push.body}
        </p>
        <p className="text-text-muted text-sm">
          {formatCreation(schedule.creation)}
        </p>
        {schedule.stop && (
          <p className="text-text-muted text-sm">
            停止情報: {formatStop(schedule.stop)}
          </p>
        )}
        {item.detail ? (
          <NotificationMonitorProgress detail={item.detail} />
        ) : (
          <div role="alert" className="text-tone-danger-text space-y-3 text-sm">
            <p>{item.errorMessage}</p>
            <Button disabled={isLoading} onClick={onReload}>
              配信集計を再読み込み
            </Button>
          </div>
        )}
        <p className="text-text-muted text-xs">
          FCM受付成功は、端末での表示や既読を示しません。
        </p>
        <ButtonLink to={`/notifications/${schedule.notificationId}`}>
          通知詳細を開く
        </ButtonLink>
      </div>
    </FormModal>
  );
}
