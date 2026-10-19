import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { VenueActionMenu } from "~/features/venues/components/list/VenueActionMenu";
import type { Venue, VenueSort } from "~/features/venues/model/venue";

type VenueTableProps = {
  currentPage: number;
  isMutating: boolean;
  isLoading: boolean;
  items: readonly Venue[];
  onDelete: (venue: Venue) => void;
  onEdit: (venue: Venue) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (columnId: string) => void;
  pageCount: number;
  pageSize: number;
  query: string;
  sort?: VenueSort;
  totalItems: number;
};

export function VenueTable({
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
}: VenueTableProps) {
  const columns: readonly DataTableColumn<Venue>[] = [
    {
      id: "id",
      header: "ID",
      sortable: true,
      width: { type: "fixed", value: 70 },
      renderCell: (venue) => venue.id,
    },
    {
      id: "name",
      header: "実施場所名",
      sortable: true,
      width: { type: "fluid", min: 130, grow: 2 },
      renderCell: (venue) => (
        <span className="text-text-base font-medium">{venue.name}</span>
      ),
    },
    {
      id: "created-at",
      header: "登録日時",
      edge: "right",
      sortable: true,
      width: { type: "fluid", min: 185, grow: 1 },
      renderCell: (venue) => venue.createdAt || "—",
    },
    {
      id: "updated-at",
      header: "更新日時",
      edge: "right",
      sortable: true,
      width: { type: "fluid", min: 185, grow: 1 },
      renderCell: (venue) => venue.updatedAt || "—",
    },
    {
      id: "actions",
      header: "",
      edge: "end",
      align: "center",
      width: { type: "fixed", value: 64 },
      renderCell: (venue) => (
        <VenueActionMenu
          disabled={isMutating}
          onDelete={onDelete}
          onEdit={onEdit}
          venue={venue}
        />
      ),
    },
  ];

  return (
    <section aria-label="実施場所一覧" className="space-y-3">
      <SearchField
        ariaLabel="実施場所を検索"
        onValueChange={onQueryChange}
        placeholder="実施場所名で検索"
        value={query}
      />

      <DataTable
        ariaLabel="実施場所一覧"
        columns={columns}
        emptyMessage={isLoading ? "読み込み中..." : "実施場所が見つかりません"}
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
        getRowKey={(venue) => venue.id}
        items={isLoading ? [] : items}
        onSortChange={onSortChange}
        sort={sort}
      />
    </section>
  );
}
