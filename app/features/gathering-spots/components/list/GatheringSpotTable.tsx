import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { GatheringSpotActionMenu } from "~/features/gathering-spots/components/list/GatheringSpotActionMenu";
import type {
  GatheringSpot,
  GatheringSpotSort,
} from "~/features/gathering-spots/model/gathering-spot";

type GatheringSpotTableProps = {
  isLoading: boolean;
  items: readonly GatheringSpot[];
  onEdit: (spot: GatheringSpot) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (columnId: string) => void;
  query: string;
  sort?: GatheringSpotSort;
};

export function GatheringSpotTable({
  isLoading,
  items,
  onEdit,
  onQueryChange,
  onSortChange,
  query,
  sort,
}: GatheringSpotTableProps) {
  const columns: readonly DataTableColumn<GatheringSpot>[] = [
    {
      id: "id",
      header: "ID",
      sortable: true,
      width: { type: "fixed", value: 70 },
      renderCell: (spot) => spot.id,
    },
    {
      id: "name",
      header: "集合場所名",
      sortable: true,
      width: { type: "fluid", min: 130, grow: 2 },
      renderCell: (spot) => (
        <span className="text-text-base font-medium">{spot.name}</span>
      ),
    },
    {
      id: "created-at",
      header: "登録日時",
      edge: "right",
      sortable: true,
      width: { type: "fluid", min: 185, grow: 1 },
      renderCell: (spot) => spot.createdAt || "—",
    },
    {
      id: "updated-at",
      header: "更新日時",
      edge: "right",
      sortable: true,
      width: { type: "fluid", min: 185, grow: 1 },
      renderCell: (spot) => spot.updatedAt || "—",
    },
    {
      id: "actions",
      header: "",
      edge: "end",
      align: "center",
      width: { type: "fixed", value: 64 },
      renderCell: (spot) => (
        <GatheringSpotActionMenu onEdit={onEdit} spot={spot} />
      ),
    },
  ];

  return (
    <section aria-label="集合場所一覧" className="space-y-3">
      <SearchField
        ariaLabel="集合場所を検索"
        onValueChange={onQueryChange}
        placeholder="集合場所名で検索"
        value={query}
      />

      <DataTable
        ariaLabel="集合場所一覧"
        columns={columns}
        emptyMessage={isLoading ? "読み込み中..." : "集合場所が見つかりません"}
        getRowKey={(spot) => spot.id}
        items={isLoading ? [] : items}
        onSortChange={onSortChange}
        sort={sort}
      />
    </section>
  );
}
