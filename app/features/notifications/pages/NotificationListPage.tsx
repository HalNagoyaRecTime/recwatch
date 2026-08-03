import { NotificationListView } from "~/features/notifications/components/NotificationListView";
import { DeleteNotificationDialog } from "~/features/notifications/components/DeleteNotificationDialog";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { useNotificationList } from "~/features/notifications/hooks/useNotificationList";

type NotificationListPageProps = {
  api: NotificationManagementApi;
};

export function NotificationListPage({ api }: NotificationListPageProps) {
  const state = useNotificationList({ api });

  return (
    <>
      {state.errorMessage ? (
        <div
          aria-live="polite"
          className="text-tone-danger-text mx-auto mb-3 w-full text-sm"
          role="alert"
        >
          {state.errorMessage}
        </div>
      ) : state.isLoading ? (
        <div aria-live="polite" className="sr-only">
          通知を読み込み中
        </div>
      ) : null}
      <NotificationListView
        currentPage={state.currentPage}
        items={state.items}
        onDelete={state.onDeleteRequest}
        onPageChange={state.onPageChange}
        onSortChange={state.onSortChange}
        pageCount={state.pageCount}
        sort={state.sort}
        totalItems={state.totalItems}
      />
      {state.selectedNotification ? (
        <DeleteNotificationDialog
          notification={state.selectedNotification}
          isSubmitting={state.isDeleting}
          onClose={state.closeDeleteDialog}
          onConfirm={state.confirmDelete}
        />
      ) : null}
    </>
  );
}
