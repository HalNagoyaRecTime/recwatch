import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import { NotificationManagementNavigation } from "~/features/notifications/components/NotificationManagementNavigation";
import { NotificationListFilters } from "~/features/notifications/components/list/NotificationListFilters";
import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { Select } from "~/components/ui/form/Select";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { NotificationCalendar } from "~/features/notifications/components/list/NotificationCalendar";
import { DeleteNotificationDialog } from "~/features/notifications/components/list/DeleteNotificationDialog";
import { NotificationsTable } from "~/features/notifications/components/list/NotificationsTable";
import type { NotificationFeedbackReporter } from "~/features/notifications/hooks/notification-feedback";
import { useNotificationList } from "~/features/notifications/hooks/useNotificationList";
import { type NotificationCreationMethodFilter } from "~/features/notifications/model/notification-list";

type NotificationViewMode = "calendar" | "list";

const notificationDisplayOptions = [
  { label: "すべて表示", value: "all" },
  { label: "自動通知", value: "automatic" },
  { label: "手動通知", value: "manual" },
] as const;

type NotificationListPageProps = {
  commandApi: AdminNotificationCommandApi;
  initialCalendarMonth?: Date;
  initialViewMode?: NotificationViewMode;
  viewMode?: NotificationViewMode;
  queryApi: AdminNotificationQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
};

export function NotificationListPage({
  commandApi,
  initialCalendarMonth = new Date(),
  initialViewMode = "list",
  viewMode: controlledViewMode,
  queryApi,
  reportFeedback,
}: NotificationListPageProps) {
  const viewMode = controlledViewMode ?? initialViewMode;
  const [calendarMonth, setCalendarMonth] = useState(
    () =>
      new Date(
        initialCalendarMonth.getFullYear(),
        initialCalendarMonth.getMonth(),
        1
      )
  );
  const state = useNotificationList({
    commandApi,
    queryApi,
    reportFeedback,
    calendarMonth: viewMode === "calendar" ? calendarMonth : undefined,
  });

  const isCalendar = viewMode === "calendar";
  const activeError = isCalendar
    ? state.calendarErrorMessage
    : state.errorMessage;
  const activeLoading = isCalendar ? state.isCalendarLoading : state.isLoading;
  const activeItemCount = isCalendar
    ? state.calendarItems.length
    : state.totalItems;

  const pagination = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Pagination
        currentPage={state.currentPage}
        onPageChange={state.onPageChange}
        pageCount={state.pageCount}
        pageSize={state.pageSize}
        totalItems={state.totalItems}
      />
    </div>
  );

  const reload = () => (isCalendar ? state.reloadCalendar() : state.reload());

  const toolbar = (
    <>
      <NotificationListFilters
        calendar={isCalendar}
        value={state.filters}
        onChange={state.onFiltersChange}
      />

      <Select
        ariaLabel="通知の作成方法"
        onValueChange={(value: NotificationCreationMethodFilter) =>
          state.onCreationMethodChange(value)
        }
        options={notificationDisplayOptions}
        value={state.creationMethod}
      />
      <Button
        aria-label="通知一覧を再読み込み"
        disabled={activeLoading || state.isDeleting}
        iconOnly
        icon={RefreshCw}
        onClick={() => void reload()}
        size="md"
        variant="secondary"
      />
    </>
  );

  return (
    <>
      <section className="mx-auto flex w-full flex-col gap-4">
        <PageHeader
          title="通知管理"
          description="通知の配信予定と処理状況を一覧・カレンダーで確認できます"
          actions={
            <div className="flex flex-wrap gap-2">
              <ButtonLink
                icon={Plus}
                to="/notifications/new"
                variant="primary"
                size="lg"
              >
                通知を作成
              </ButtonLink>
            </div>
          }
        />

        <NotificationManagementNavigation
          active={isCalendar ? "calendar" : "list"}
        />
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>

        {activeError && activeItemCount > 0 ? (
          <p
            aria-live="polite"
            className="text-tone-danger-text text-sm"
            role="alert"
          >
            {activeError}
          </p>
        ) : null}

        {viewMode === "calendar" ? (
          <>
            {state.isCalendarLoading ? (
              <p
                aria-live="polite"
                className="text-text-muted text-sm"
                role="status"
              >
                カレンダーを読み込み中です
              </p>
            ) : null}
            {state.calendarErrorMessage && state.calendarItems.length === 0 ? (
              <div
                className="border-tone-danger-border bg-tone-danger-bg app-rounded flex items-center justify-between gap-3 border px-4 py-3"
                role="alert"
              >
                <p className="text-tone-danger-text">
                  {state.calendarErrorMessage}
                </p>
                <Button
                  onClick={() => void reload()}
                  size="md"
                  variant="secondary"
                >
                  再試行
                </Button>
              </div>
            ) : null}
            <NotificationCalendar
              items={state.calendarItems}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              showEmptyState={
                !state.isCalendarLoading && !state.calendarErrorMessage
              }
            />
          </>
        ) : activeLoading && activeItemCount === 0 ? (
          <div
            aria-live="polite"
            className="border-border-base text-text-muted app-rounded border px-5 py-16 text-center"
            role="status"
          >
            通知を読み込み中です
          </div>
        ) : activeError && activeItemCount === 0 ? (
          <div
            className="border-tone-danger-border bg-tone-danger-bg app-rounded flex flex-col items-center gap-3 border px-5 py-12 text-center"
            role="alert"
          >
            <p className="text-tone-danger-text">{activeError}</p>
            <Button onClick={() => void reload()} size="md" variant="secondary">
              再試行
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <>
            <NotificationsTable
              now={state.now}
              filters={state.filters}
              items={state.items}
              onDelete={state.onDeleteRequest}
              onSortChange={state.onSortChange}
              sort={state.sort}
            />
            <div>{pagination}</div>
          </>
        ) : null}
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
