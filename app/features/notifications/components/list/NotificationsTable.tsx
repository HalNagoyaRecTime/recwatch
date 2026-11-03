import { NotificationAudienceSummary } from "~/features/notifications/components/list/NotificationAudienceSummary";
import { NotificationPushSummary } from "~/features/notifications/components/list/NotificationPushSummary";
import type { ReactNode } from "react";

import { TextLink } from "~/components/ui/button/TextLink";
import {
  DataTable,
  type DataTableColumn,
} from "~/components/ui/data-table/DataTable";
import type { AdminNotificationListItem } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { NotificationActionMenu } from "~/features/notifications/components/list/NotificationActionMenu";
import {
  formatNotificationCreator,
  formatNotificationScheduleDateTime,
} from "~/features/notifications/components/list/notification-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { selectRepresentativeSchedule } from "~/features/notifications/model/notification-list-data";
import type {
  NotificationListFilters,
  NotificationListSort,
} from "~/features/notifications/model/notification-list";

function getNotificationTableColumns(
  filters?: NotificationListFilters,
  now = 0
): readonly DataTableColumn<AdminNotificationListItem>[] {
  return [
    {
      header: "ID",
      id: "notificationId",
      sortable: true,
      width: { type: "fixed", value: 72 },
      renderCell: (item) => `#${item.notificationId}`,
    },
    {
      header: "通知内容",
      id: "title",
      padding: "wide",
      sortable: true,
      width: { grow: 2, min: 230, type: "fluid" },
      renderCell: (item) => (
        <div className="min-w-0 space-y-1">
          <TextLink
            variant="inline"
            aria-label={`${item.content.push.title}の詳細を表示`}
            to={`/notifications/${item.notificationId}`}
          >
            {item.content.push.title}
          </TextLink>
          <p className="text-text-muted truncate text-xs">
            {item.content.push.body || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "配信予定",
      id: "sendAt",
      sortable: true,
      width: { grow: 1, min: 170, type: "fluid" },
      renderCell: (item) => {
        const schedule = selectRepresentativeSchedule(item, now, filters);
        const additionalCount = Math.max(item.schedules.length - 1, 0);
        return (
          <div className="min-w-0 space-y-1">
            <p className="truncate">
              {formatNotificationScheduleDateTime(schedule?.sendAt)}
            </p>
            {additionalCount > 0 ? (
              <p className="text-text-muted truncate text-xs">
                他{additionalCount}件
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      header: "対象",
      id: "audience",
      sortable: true,
      width: { grow: 1, min: 130, type: "fluid" },
      renderCell: (item) => (
        <NotificationAudienceSummary
          schedule={selectRepresentativeSchedule(item, now, filters)}
        />
      ),
    },
    {
      header: "Push送信先",
      id: "pushSummary",
      width: { grow: 1, min: 170, type: "fluid" },
      renderCell: (item) => (
        <NotificationPushSummary
          schedule={selectRepresentativeSchedule(item, now, filters)}
        />
      ),
    },
    {
      header: "作成者",
      id: "creator",
      sortable: true,
      width: { grow: 1, min: 180, type: "fluid" },
      renderCell: (item) => {
        const creator =
          item.creation.method === "automatic"
            ? "自動"
            : formatNotificationCreator(item);
        return (
          <span className="block truncate" title={creator}>
            {creator}
          </span>
        );
      },
    },
    {
      header: "状態",
      id: "status",
      sortable: true,
      width: { grow: 0.8, min: 150, resizable: false, type: "fluid" },
      renderCell: (item) => {
        const schedule = selectRepresentativeSchedule(item, now, filters);
        return schedule ? (
          <NotificationStatusBadge status={schedule.status} />
        ) : (
          <span className="text-text-muted">—</span>
        );
      },
    },
    {
      align: "center",
      header: "",
      id: "actions",
      edge: "end",
      width: { type: "fixed", value: 64 },
      renderCell: (item) => <NotificationActionMenu notification={item} />,
    },
  ];
}

type NotificationsTableProps = {
  now?: number;
  filters?: NotificationListFilters;
  footer?: ReactNode;
  items: readonly AdminNotificationListItem[];
  onDelete?: (item: AdminNotificationListItem) => void;
  onSortChange: (columnId: string) => void;
  sort?: NotificationListSort;
};

export function NotificationsTable({
  now = 0,
  filters,
  footer,
  items,
  onDelete,
  onSortChange,
  sort,
}: NotificationsTableProps) {
  const notificationTableColumns = getNotificationTableColumns(filters, now);
  const columns = notificationTableColumns.map((column) =>
    column.id === "actions"
      ? {
          ...column,
          renderCell: (item: AdminNotificationListItem) => (
            <NotificationActionMenu notification={item} onDelete={onDelete} />
          ),
        }
      : column
  );

  return (
    <DataTable
      ariaLabel="通知一覧"
      rowSizing="content"
      columns={columns}
      emptyMessage="条件に一致する通知はありません"
      footer={footer}
      getRowKey={(item) => String(item.notificationId)}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
