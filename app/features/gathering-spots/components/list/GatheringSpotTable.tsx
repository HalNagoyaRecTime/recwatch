import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { GatheringSpotActionMenu } from "~/features/gathering-spots/components/list/GatheringSpotActionMenu";
import type {
  GatheringSpot,
  GatheringSpotSort,
} from "~/features/gathering-spots/model/gathering-spot";

type GatheringSpotTableProps = {
  currentPage: number;
  isMutating: boolean;
  isLoading: boolean;
  items: readonly GatheringSpot[];
  onDelete: (spot: GatheringSpot) => void;
  onEdit: (spot: GatheringSpot) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (columnId: string) => void;
  pageCount: number;
  pageSize: number;
  query: string;
  sort?: GatheringSpotSort;
  totalItems: number;
};

export function GatheringSpotTable({
  currentPage,
  isMutating,
  isLoading,
  items,
  onDelete,
  onEdit,
  onPageChange,
  onQueryChange,
  onSortChange,
  pageCount,
  pageSize,
  query,
  sort,
  totalItems,
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
        <GatheringSpotActionMenu
          disabled={isMutating}
          onDelete={onDelete}
          onEdit={onEdit}
          spot={spot}
        />
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
        footer={
          pageCount > 1 ? (
            <Pagination
              currentPage={currentPage}
              onPageChange={onPageChange}
              pageCount={pageCount}
              pageSize={pageSize}
              totalItems={totalItems}
            />
          ) : undefined
        }
        getRowKey={(spot) => spot.id}
        items={isLoading ? [] : items}
        onSortChange={onSortChange}
        sort={sort}
      />
    </section>
  );
}
