import { CalendarDays, Grid2X2, List, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import {
  SearchCombobox,
  type SearchOption,
} from "~/components/ui/form/SearchCombobox";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { Select } from "~/components/ui/form/Select";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { DeleteNotificationDialog } from "~/features/notifications/components/list/DeleteNotificationDialog";
import { NotificationsTable } from "~/features/notifications/components/list/NotificationsTable";
import { useNotificationList } from "~/features/notifications/hooks/useNotificationList";
import { notificationListPageSize } from "~/features/notifications/model/notification-list";

const notificationViewOptions = [
  {
    icon: CalendarDays,
    label: "カレンダー表示",
    value: "calendar",
  },
  {
    icon: Grid2X2,
    label: "グリッド表示",
    value: "grid",
  },
  {
    icon: List,
    label: "リスト表示",
    value: "list",
  },
] as const;

type NotificationViewMode = (typeof notificationViewOptions)[number]["value"];

const notificationDisplayOptions = [
  { label: "すべて表示", value: "all" },
  { label: "自動", value: "automatic" },
  { label: "手動", value: "manual" },
  { label: "未実装", value: "unimplemented" },
] as const;

type NotificationDisplayMode =
  (typeof notificationDisplayOptions)[number]["value"];

const notificationSearchOptions: readonly SearchOption[] = [];

type NotificationListPageProps = {
  api: NotificationManagementApi;
};

export function NotificationListPage({ api }: NotificationListPageProps) {
  const state = useNotificationList({ api });
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] =
    useState<NotificationDisplayMode>("all");
  const [viewMode, setViewMode] = useState<NotificationViewMode>("list");

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
              通知を作成
            </ButtonLink>
          }
        />

        <div className="flex gap-3">
          <SearchCombobox
            ariaLabel="通知を検索（未実装）"
            emptyMessage="通知検索は未実装です"
            onOptionSelect={(option) => setSearchQuery(option.label)}
            onQueryChange={setSearchQuery}
            options={notificationSearchOptions}
            placeholder="通知を検索（未実装）"
            query={searchQuery}
          />
          <Select
            ariaLabel="通知の表示範囲"
            onValueChange={setDisplayMode}
            options={notificationDisplayOptions}
            value={displayMode}
          />
          <SegmentedControl
            ariaLabel="表示形式"
            behavior="selection"
            onValueChange={setViewMode}
            options={notificationViewOptions}
            value={viewMode}
          />
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

        {viewMode === "list" ? (
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
        ) : (
          <div
            aria-label="通知の表示形式（未実装）"
            className="text-text-muted flex min-h-60 items-center justify-center text-lg"
            role="status"
          >
            未実装
          </div>
        )}
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
