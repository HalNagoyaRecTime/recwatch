import { Button } from "~/components/ui/button/Button";
import { FormModal } from "~/components/ui/modal/FormModal";
import type { NotificationScheduleListItem } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  canRunMonitorAction,
  monitorActionLabels,
  type MonitorAction,
  type useNotificationMonitorActions,
} from "~/features/notifications/hooks/useNotificationMonitorActions";

type ActionState = ReturnType<typeof useNotificationMonitorActions>;
export function NotificationMonitorActions({
  schedule,
  state,
  disabled = false,
  onSelect,
}: {
  schedule: NotificationScheduleListItem;
  state: ActionState;
  disabled?: boolean;
  onSelect?: (id: number) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label={`Schedule #${schedule.notificationScheduleId}の操作`}
    >
      {(["resend", "cancel", "stop"] as MonitorAction[])
        .filter((action) => canRunMonitorAction(schedule, action))
        .map((action) => (
          <Button
            key={action}
            variant={action === "resend" ? "secondary" : "danger"}
            disabled={disabled || state.isSubmitting}
            onClick={() => {
              onSelect?.(schedule.notificationScheduleId);
              state.open(schedule, action);
            }}
          >
            {monitorActionLabels[action]}
          </Button>
        ))}
    </div>
  );
}
export function NotificationMonitorActionDialog({
  state,
}: {
  state: ActionState;
}) {
  const target = state.target;
  if (!target) return null;
  return (
    <FormModal
      title={`${monitorActionLabels[target.action]}の確認`}
      onClose={state.close}
      isDismissDisabled={state.isSubmitting}
    >
      <div className="space-y-4">
        <p className="text-sm">
          Notification #{target.schedule.notificationId} / Schedule #
          {target.schedule.notificationScheduleId}
          <br />
          {target.schedule.content.push.title}
        </p>
        {target.action === "resend" ? (
          <>
            <p className="text-text-muted text-sm">
              元の配信先条件を使い、新しいScheduleを作成します。対象者は配信時に再確定します。
            </p>
            <label className="block text-sm">
              再送タイミング
              <select
                className="border-border-base mt-1 block w-full rounded-md border p-2"
                value={state.timing}
                disabled={state.isSubmitting}
                onChange={(e) =>
                  state.setTiming(
                    e.currentTarget.value as "immediate" | "scheduled"
                  )
                }
              >
                <option value="immediate">今すぐ再送</option>
                <option value="scheduled">日時を指定</option>
              </select>
            </label>
            {state.timing === "scheduled" && (
              <label className="block text-sm">
                再送日時
                <input
                  type="datetime-local"
                  className="border-border-base mt-1 block w-full rounded-md border p-2"
                  value={state.sendAt}
                  disabled={state.isSubmitting}
                  onChange={(e) => state.setSendAt(e.currentTarget.value)}
                />
              </label>
            )}
          </>
        ) : (
          <p className="text-text-muted text-sm">
            {target.action === "cancel"
              ? "未開始の配信予約を削除します。通知自体は削除しません。"
              : "新しいPush送信と再試行を停止します。送信開始済みのリクエストは取り消せません。"}
          </p>
        )}
        {state.schedule && (
          <p className="text-text-muted text-sm">
            最新の状態: {state.schedule.status}
          </p>
        )}
        {!state.canSubmit && (
          <p role="status" className="text-sm">
            この配信は削除済み、または現在の状態では操作できません。
          </p>
        )}
        {state.error && (
          <p role="alert" className="text-tone-danger-text text-sm">
            {state.error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            disabled={state.isSubmitting}
            onClick={state.close}
          >
            戻る
          </Button>
          <Button
            variant={target.action === "resend" ? "primary" : "danger"}
            disabled={!state.canSubmit || state.isSubmitting}
            onClick={() => void state.submit()}
          >
            {state.isSubmitting ? "処理中..." : "実行する"}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
