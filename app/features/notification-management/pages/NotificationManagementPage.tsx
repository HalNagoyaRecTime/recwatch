import { useEffect, useState } from "react";
import { CircleAlertIcon } from "lucide-react";

import type { NotificationScheduleGateway } from "../application/notification-schedule-gateway";
import { CancelNotificationDialog } from "../components/CancelNotificationDialog";
import { NotificationScheduleTable } from "../components/NotificationScheduleTable";
import type { NotificationSchedule } from "../model/notification-schedule";

type NotificationManagementPageProps = {
  gateway: NotificationScheduleGateway;
};

export function NotificationManagementPage({
  gateway,
}: NotificationManagementPageProps) {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<NotificationSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    gateway
      .list()
      .then((items) => {
        if (active) {
          setSchedules(items);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage("通知予定を取得できませんでした。");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [gateway]);

  async function handleCancel() {
    if (!selectedSchedule || isCanceling) {
      return;
    }

    setIsCanceling(true);
    setErrorMessage("");

    try {
      const canceledSchedule = await gateway.cancel(selectedSchedule.id);
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === canceledSchedule.id ? canceledSchedule : schedule
        )
      );
      setSelectedSchedule(null);
    } catch {
      setErrorMessage("通知予定をキャンセルできませんでした。");
    } finally {
      setIsCanceling(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header>
        <h1 className="text-xl font-semibold">通知管理</h1>
        <p className="mt-2 text-sm text-[color:var(--text-3)]">
          通知予定の一覧と配信状態を確認できます
        </p>
      </header>

      <div aria-live="polite" className="mt-4 min-h-5">
        {errorMessage ? (
          <p className="text-sm text-[color:var(--tone-red-text)]">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex min-h-12 items-center gap-2.5 rounded-lg border border-amber-400/70 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
        <CircleAlertIcon size={16} className="shrink-0" aria-hidden="true" />
        <p>
          配信件数・成功件数の詳細は FCM（Firebase Cloud
          Messaging）の管理画面で確認してください。
        </p>
      </div>

      <section className="mt-4" aria-label="通知予定一覧">
        {isLoading ? (
          <div className="rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-8 text-center text-sm text-[color:var(--text-3)]">
            読み込み中...
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-8 text-center text-sm text-[color:var(--text-3)]">
            通知予定はありません
          </div>
        ) : (
          <NotificationScheduleTable
            schedules={schedules}
            onCancel={setSelectedSchedule}
          />
        )}
      </section>

      {selectedSchedule ? (
        <CancelNotificationDialog
          schedule={selectedSchedule}
          isSubmitting={isCanceling}
          onClose={() => setSelectedSchedule(null)}
          onConfirm={handleCancel}
        />
      ) : null}
    </div>
  );
}
