import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import type { CompetitionListItem } from "~/features/sports/model/competition-list-item";
import { ManagementRowActionMenu } from "~/features/user-management/components/ManagementRowActionMenu";

type CompetitionTableProps = {
  emptyMessage: string;
  isMutating: boolean;
  items: readonly CompetitionListItem[];
  onDelete: (item: CompetitionListItem) => void;
  onEdit: (item: CompetitionListItem) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

export function CompetitionTable({
  emptyMessage,
  isMutating,
  items,
  onDelete,
  onEdit,
  onSortChange,
  sort,
}: CompetitionTableProps) {
  const columns: readonly DataTableColumn<CompetitionListItem>[] = [
    {
      header: "イベントID",
      id: "event-id",
      sortable: true,
      width: { type: "fixed", value: 100 },
      renderCell: (item) => item.code,
    },
    {
      header: "イベント名",
      id: "event-name",
      sortable: true,
      width: { type: "fluid", min: 200, grow: 2 },
      renderCell: (item) => (
        <span className="text-text-base font-semibold">{item.name}</span>
      ),
    },
    {
      header: "実施場所",
      id: "venue",
      sortable: true,
      width: { type: "fluid", min: 160, grow: 1 },
      renderCell: (item) => item.venue,
    },
    {
      header: "開催時間",
      id: "event-time",
      sortable: true,
      width: { type: "fluid", min: 150, grow: 1 },
      renderCell: (item) => `${item.startTime}〜${item.endTime}`,
    },
    {
      header: "集合情報",
      id: "gathering",
      sortable: true,
      width: { type: "fluid", min: 190, grow: 1 },
      renderCell: (item) => `${item.meetingTime} / ${item.meetingPlace}`,
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (item) => (
        <ManagementRowActionMenu
          ariaLabel={`${item.name}の操作`}
          disabled={isMutating}
          onDelete={() => onDelete(item)}
          onEdit={() => onEdit(item)}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="イベント登録一覧"
      columns={columns}
      emptyMessage={emptyMessage}
      getRowKey={(item) => item.id}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
