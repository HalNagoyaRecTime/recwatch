import { Plus, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { DeleteNotificationDialog } from "~/features/notifications/components/list/DeleteNotificationDialog";
import { NotificationsTable } from "~/features/notifications/components/list/NotificationsTable";
import { useNotificationList } from "~/features/notifications/hooks/useNotificationList";
import { notificationListPageSize } from "~/features/notifications/model/notification-list";

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
      <section className="mx-auto flex w-full flex-col gap-4">
        <PageHeader
          title="通知一覧"
          description="配信済み通知の一覧と配信状況を確認できます"
          actions={
            <ButtonLink
              icon={Plus}
              to="/notifications/new"
              variant="primary"
              size="lg"
            >
              新規登録
            </ButtonLink>
          }
        />

        <div className="flex justify-end">
          <Button
            aria-label="通知一覧を再読み込み"
            disabled={state.isLoading || state.isDeleting}
            iconOnly
            icon={RefreshCw}
            onClick={() => void state.reload()}
            size="md"
            variant="secondary"
          />
        </div>

        <NotificationsTable
          footer={
            state.pageCount > 1 ? (
              <Pagination
                currentPage={state.currentPage}
                onPageChange={state.onPageChange}
                pageCount={state.pageCount}
                pageSize={notificationListPageSize}
                totalItems={state.totalItems}
              />
            ) : undefined
          }
          items={state.items}
          onDelete={state.onDeleteRequest}
          onSortChange={state.onSortChange}
          sort={state.sort}
        />
      </section>
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
