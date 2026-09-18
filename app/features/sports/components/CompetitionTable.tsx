import { Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import type { CompetitionListItem } from "~/features/sports/model/competition-list-item";

type CompetitionTableProps = {
  emptyMessage: string;
  isMutating: boolean;
  items: readonly CompetitionListItem[];
  onDelete: (item: CompetitionListItem) => void;
  onOpenDetail: (item: CompetitionListItem) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

/** イベント一覧。行からは詳細と削除だけを行い、編集・集合設定はイベント詳細から行う。 */
export function CompetitionTable({
  emptyMessage,
  isMutating,
  items,
  onDelete,
  onOpenDetail,
  onSortChange,
  sort,
}: CompetitionTableProps) {
  const columns: readonly DataTableColumn<CompetitionListItem>[] = [
    {
      header: "ID",
      id: "event-id",
      sortable: true,
      width: { type: "fixed", value: 80 },
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
      header: "初回集合時間",
      id: "gathering",
      sortable: true,
      width: { type: "fluid", min: 120, grow: 1 },
      // 集合場所はイベントごとに複数あるため一覧には出さず、最初の集合時刻だけを出す
      renderCell: (item) =>
        item.gatheringSummary.firstGatheringTime ?? (
          <span className="text-text-muted">未設定</span>
        ),
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 128 },
      renderCell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            disabled={isMutating}
            onClick={() => onOpenDetail(item)}
            size="sm"
            type="button"
            variant="secondary"
          >
            詳細
          </Button>
          <Button
            aria-label={`${item.name}を削除`}
            disabled={isMutating}
            icon={Trash2}
            iconOnly
            onClick={() => onDelete(item)}
            size="sm"
            type="button"
            variant="danger"
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="イベント一覧"
      columns={columns}
      emptyMessage={emptyMessage}
      getRowKey={(item) => item.id}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
