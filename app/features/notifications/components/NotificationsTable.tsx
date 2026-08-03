import { Check, Clock3, X } from "lucide-react";
import type { ReactNode } from "react";

import { TextLink } from "~/components/ui/button/TextLink";
import {
  DataTable,
  type DataTableColumn,
} from "~/components/ui/data-table/DataTable";
import type { NotificationListItem } from "~/features/notifications/model/notification-list-item";
import type { NotificationListSort } from "~/features/notifications/model/notification-list-sort";
import { NotificationActionMenu } from "~/features/notifications/components/NotificationActionMenu";

const notificationTableColumns: readonly DataTableColumn<NotificationListItem>[] =
  [
    {
      header: "件名",
      id: "title",
      padding: "wide",
      sortable: true,
      width: {
        grow: 2.2,
        min: 180,
        type: "fluid",
      },
      renderCell: (item) => (
        <TextLink
          aria-label={`${item.title}の詳細を表示`}
          to={`/notifications/${item.id}`}
        >
          {item.title}
        </TextLink>
      ),
    },
    {
      header: "配信対象",
      id: "audience",
      sortable: true,
      width: {
        grow: 0.7,
        min: 110,
        type: "fluid",
      },
      renderCell: (item) => item.audience,
    },
    {
      header: "配信日時",
      id: "deliveredAt",
      sortable: true,
      width: {
        grow: 0.8,
        min: 110,
        type: "fluid",
      },
      renderCell: (item) => item.deliveredAt,
    },
    {
      header: "作成・配信者",
      id: "sender",
      sortable: true,
      width: {
        grow: 0.8,
        min: 140,
        type: "fluid",
      },
      renderCell: (item) => item.sender,
    },
    {
      header: "関連競技",
      id: "competition",
      sortable: true,
      width: {
        grow: 1,
        min: 110,
        type: "fluid",
      },
      renderCell: (item) => item.competition,
    },
    {
      header: "関連スケジュール",
      id: "schedule",
      sortable: true,
      width: {
        grow: 1,
        min: 170,
        type: "fluid",
      },
      renderCell: (item) => item.schedule,
    },
    {
      header: "状態",
      id: "status",
      sortable: true,
      width: {
        grow: 0.7,
        min: 104,
        resizable: false,
        type: "fluid",
      },
      renderCell: (item) => <DeliveryStatus status={item.status} />,
    },
    {
      align: "center",
      header: "",
      id: "actions",
      edge: "end",
      width: {
        type: "fixed",
        value: 64,
      },
      renderCell: (item) => <NotificationActionMenu notification={item} />,
    },
  ];

type NotificationsTableProps = {
  footer?: ReactNode;
  items: readonly NotificationListItem[];
  onDelete?: (item: NotificationListItem) => void;
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
          renderCell: (item: NotificationListItem) => (
            <NotificationActionMenu notification={item} onDelete={onDelete} />
          ),
        }
      : column
  );

  return (
    <DataTable
      ariaLabel="通知一覧"
      columns={columns}
      footer={footer}
      getRowKey={(item) => item.id}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}

function DeliveryStatus({
  status,
}: {
  status: NotificationListItem["status"];
}) {
  const delivered = status === "delivered";
  const pending = status === "pending";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        delivered
          ? "text-tone-success-text"
          : pending
            ? "text-text-muted"
            : "text-tone-danger-text"
      }`}
    >
      {delivered ? (
        <Check aria-hidden="true" className="size-4" />
      ) : pending ? (
        <Clock3 aria-hidden="true" className="size-4" />
      ) : (
        <X aria-hidden="true" className="size-4" />
      )}
      {delivered ? "配信済" : pending ? "送信中" : "送信失敗"}
    </span>
  );
}
