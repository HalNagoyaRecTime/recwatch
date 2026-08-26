import { Check, Clock3, X } from "lucide-react";
import type { ReactNode } from "react";

import {
  DataTable,
  type DataTableColumn,
} from "~/components/ui/data-table/DataTable";
import { NotificationActionMenu } from "~/features/notifications/components/list/NotificationActionMenu";
import type {
  NotificationListItem,
  NotificationListSort,
} from "~/features/notifications/model/notification-list";

const notificationTableColumns: readonly DataTableColumn<NotificationListItem>[] =
  [
    {
      header: "id",
      id: "id",
      sortable: true,
      width: {
        type: "fixed",
        value: 72,
      },
      renderCell: (item) => item.id,
    },
    {
      header: "件名",
      id: "title",
      padding: "wide",
      sortable: true,
      width: {
        grow: 2.2,
        min: 90,
        type: "fluid",
      },
      renderCell: (item) => item.title,
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
      header: "関連イベント",
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
        min: 160,
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
        min: 90,
        resizable: false,
        type: "fluid",
      },
      renderCell: (item) => <DeliveryStatus status={item.status} />,
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      renderCell: (item) => <NotificationActionMenu notification={item} />,
      width: {
        type: "fixed",
        value: 64,
      },
    },
  ];

type NotificationsTableProps = {
  footer?: ReactNode;
  items: readonly NotificationListItem[];
  onSortChange: (columnId: string) => void;
  sort?: NotificationListSort;
};

export function NotificationsTable({
  footer,
  items,
  onSortChange,
  sort,
}: NotificationsTableProps) {
  return (
    <DataTable
      ariaLabel="通知管理"
      columns={notificationTableColumns}
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
  const delivered = status === "sent";
  const draft = status === "draft";
  const sending = status === "sending";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        delivered
          ? "text-tone-success-text"
          : draft || sending
            ? "text-text-muted"
            : "text-tone-danger-text"
      }`}
    >
      {delivered ? (
        <Check aria-hidden="true" className="size-4" />
      ) : draft || sending ? (
        <Clock3 aria-hidden="true" className="size-4" />
      ) : (
        <X aria-hidden="true" className="size-4" />
      )}
      {delivered
        ? "配信済"
        : draft
          ? "未送信"
          : sending
            ? "送信中"
            : "送信失敗"}
    </span>
  );
}
