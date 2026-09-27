import type { ReactNode } from "react";

import { TextLink } from "~/components/ui/button/TextLink";
import {
  DataTable,
  type DataTableColumn,
} from "~/components/ui/data-table/DataTable";
import type { AdminNotificationListItem } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { NotificationActionMenu } from "~/features/notifications/components/list/NotificationActionMenu";
import {
  formatNotificationAudience,
  formatNotificationCreationMethod,
  formatNotificationCreator,
  formatNotificationDateTime,
  formatNotificationImportance,
} from "~/features/notifications/components/list/notification-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import {
  canModifyNotification,
  selectRepresentativeSchedule,
} from "~/features/notifications/hooks/notification-list-data";
import type { NotificationListSort } from "~/features/notifications/model/notification-list";

const notificationTableColumns: readonly DataTableColumn<AdminNotificationListItem>[] =
  [
    {
      header: "id",
      id: "notificationId",
      sortable: true,
      width: { type: "fixed", value: 72 },
      renderCell: (item) => item.notificationId,
    },
    {
      header: "件名",
      id: "title",
      padding: "wide",
      sortable: true,
      width: { grow: 2, min: 150, type: "fluid" },
      renderCell: (item) => (
        <TextLink
          aria-label={`${item.content.push.title}の詳細を表示`}
          to={`/notifications/${item.notificationId}`}
        >
          {item.content.push.title}
        </TextLink>
      ),
    },
    {
      header: "配信対象",
      id: "audience",
      sortable: true,
      width: { grow: 1, min: 130, type: "fluid" },
      renderCell: (item) =>
        formatNotificationAudience(selectRepresentativeSchedule(item)),
    },
    {
      header: "配信日時",
      id: "sendAt",
      sortable: true,
      width: { grow: 1, min: 155, type: "fluid" },
      renderCell: (item) => {
        const schedule = selectRepresentativeSchedule(item);
        const additionalCount = Math.max(item.schedules.length - 1, 0);
        return (
          <span>
            {formatNotificationDateTime(schedule?.sendAt)}
            {additionalCount > 0 ? `（他${additionalCount}件）` : ""}
          </span>
        );
      },
    },
    {
      header: "作成方法",
      id: "creationMethod",
      sortable: true,
      width: { grow: 0.6, min: 90, type: "fluid" },
      renderCell: formatNotificationCreationMethod,
    },
    {
      header: "作成者・参照元",
      id: "creator",
      sortable: true,
      width: { grow: 1, min: 135, type: "fluid" },
      renderCell: formatNotificationCreator,
    },
    {
      header: "重要度",
      id: "importance",
      sortable: true,
      width: { grow: 0.5, min: 80, type: "fluid" },
      renderCell: (item) => formatNotificationImportance(item.importance),
    },
    {
      header: "状態",
      id: "status",
      sortable: true,
      width: { grow: 0.8, min: 120, resizable: false, type: "fluid" },
      renderCell: (item) => {
        const schedule = selectRepresentativeSchedule(item);
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

type NotificationsTableProps = {
  footer?: ReactNode;
  items: readonly AdminNotificationListItem[];
  onDelete?: (item: AdminNotificationListItem) => void;
  onSortChange: (columnId: string) => void;
  sort?: NotificationListSort;
};

export function NotificationsTable({
  footer,
  items,
  onDelete,
  onSortChange,
  sort,
}: NotificationsTableProps) {
  const columns = notificationTableColumns.map((column) =>
    column.id === "actions"
      ? {
          ...column,
          renderCell: (item: AdminNotificationListItem) => (
            <NotificationActionMenu
              canModify={canModifyNotification(item)}
              notification={item}
              onDelete={onDelete}
            />
          ),
        }
      : column
  );

  return (
    <DataTable
      ariaLabel="通知一覧"
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
