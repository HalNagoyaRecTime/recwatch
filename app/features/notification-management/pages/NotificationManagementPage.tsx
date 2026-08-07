import { useEffect, useState } from "react";
import { CircleAlertIcon } from "lucide-react";

import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { NotificationManagementError } from "~/features/notifications/api/contracts/errors/notification-management-error";
import { getNotificationManagementErrorMessage } from "~/features/notifications/hooks/notification-error-messages";
import { DeleteNotificationDialog } from "../components/DeleteNotificationDialog";
import { NotificationManagementTable } from "../components/NotificationManagementTable";
import type { ManagedNotification } from "~/features/notifications/model/notification";

type NotificationManagementPageProps = {
  api: NotificationManagementApi;
};

const PAGE_SIZE = 50;

function toErrorMessage(error: unknown) {
  return error instanceof NotificationManagementError
    ? getNotificationManagementErrorMessage(error.kind)
    : getNotificationManagementErrorMessage("unexpected");
}

export function NotificationManagementPage({
  api,
}: NotificationManagementPageProps) {
  const [notifications, setNotifications] = useState<ManagedNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedNotification, setSelectedNotification] =
    useState<ManagedNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    api
      .list({ limit: PAGE_SIZE, offset: 0 })
      .then((items) => {
        if (active) {
          setNotifications(items.notifications);
          setTotal(items.total);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(toErrorMessage(error));
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
  }, [api]);

  async function handleLoadMore() {
    if (isLoadingMore || notifications.length >= total) {
      return;
    }

    setIsLoadingMore(true);
    setErrorMessage("");

    try {
      const page = await api.list({
        limit: PAGE_SIZE,
        offset: notifications.length,
      });
      setNotifications((current) => [
        ...current,
        ...page.notifications.filter(
          (item) => !current.some((notification) => notification.id === item.id)
        ),
      ]);
      setTotal(page.total);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleDelete() {
    if (!selectedNotification || isDeleting || isLoadingMore) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await api.delete(selectedNotification.id);
      setNotifications((current) =>
        current.filter(
          (notification) => notification.id !== selectedNotification.id
        )
      );
      setTotal((current) => Math.max(0, current - 1));
      setSelectedNotification(null);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      if (
        error instanceof NotificationManagementError &&
        error.kind === "conflict"
      ) {
        const refreshed = await reloadVisibleNotifications(
          api,
          notifications.length
        ).catch(() => null);
        if (refreshed) {
          setNotifications(refreshed.notifications);
          setTotal(refreshed.total);
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
          <>
            <NotificationManagementTable
              notifications={notifications}
              isDeleteDisabled={isLoadingMore}
              onDelete={setSelectedNotification}
            />
            {notifications.length < total ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={isLoadingMore}
                  className="h-9 rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] px-5 text-sm font-medium transition hover:bg-[color:var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleLoadMore}
                >
                  {isLoadingMore ? "読み込み中..." : "さらに読み込む"}
                </button>
              </div>
            ) : null}
          </>
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

async function reloadVisibleNotifications(
  api: NotificationManagementApi,
  visibleCount: number
) {
  const notifications: ManagedNotification[] = [];
  let total = 0;
  let offset = 0;

  do {
    const page = await api.list({ limit: PAGE_SIZE, offset });
    notifications.push(...page.notifications);
    total = page.total;
    offset += page.notifications.length;

    if (page.notifications.length === 0) {
      break;
    }
  } while (notifications.length < visibleCount && notifications.length < total);

  return { notifications, total };
}
