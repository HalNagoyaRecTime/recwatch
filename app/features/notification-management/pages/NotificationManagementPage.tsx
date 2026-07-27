import { useEffect, useState } from "react";
import { CircleAlertIcon } from "lucide-react";

import type { AdminNotificationManagementGateway } from "../application/admin-notification-management-gateway";
import {
  NotificationManagementError,
  notificationManagementErrorMessages,
} from "../application/notification-management-error";
import { DeleteNotificationDialog } from "../components/DeleteNotificationDialog";
import { NotificationManagementTable } from "../components/NotificationManagementTable";
import type { ManagedNotification } from "../model/managed-notification";

type NotificationManagementPageProps = {
  gateway: AdminNotificationManagementGateway;
};

export function NotificationManagementPage({
  gateway,
}: NotificationManagementPageProps) {
  const [notifications, setNotifications] = useState<ManagedNotification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<ManagedNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    gateway
      .list()
      .then((items) => {
        if (active) {
          setNotifications(items.notifications);
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

  async function handleDelete() {
    if (!selectedNotification || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await gateway.delete(selectedNotification.id);
      setNotifications((current) =>
        current.filter(
          (notification) => notification.id !== selectedNotification.id
        )
      );
      setSelectedNotification(null);
    } catch (error) {
      setErrorMessage(
        error instanceof NotificationManagementError
          ? notificationManagementErrorMessages[error.kind]
          : notificationManagementErrorMessages.unexpected
      );
      if (
        error instanceof NotificationManagementError &&
        error.kind === "conflict"
      ) {
        const page = await gateway.list().catch(() => null);
        if (page) {
          setNotifications(page.notifications);
        }
        setSelectedNotification(null);
      }
    } finally {
      setIsDeleting(false);
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
          端末単位の配信結果の詳細は FCM（Firebase Cloud
          Messaging）の管理画面で確認してください。
        </p>
      </div>

      <section className="mt-4" aria-label="通知予定一覧">
        {isLoading ? (
          <div className="rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-8 text-center text-sm text-[color:var(--text-3)]">
            読み込み中...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-8 text-center text-sm text-[color:var(--text-3)]">
            通知予定はありません
          </div>
        ) : (
          <NotificationManagementTable
            notifications={notifications}
            onDelete={setSelectedNotification}
          />
        )}
      </section>

      {selectedNotification ? (
        <DeleteNotificationDialog
          notification={selectedNotification}
          isSubmitting={isDeleting}
          onClose={() => setSelectedNotification(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
