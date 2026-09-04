import { Link } from "react-router";
import type { ReactNode } from "react";

import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import type { Team } from "~/features/team/model/team";
import { TeamActionMenu } from "~/features/team/components/TeamActionMenu";
import { formatDisplayDateTime } from "~/lib/format-display-date-time";

type TeamTableProps = {
  footer?: ReactNode;
  items: readonly Team[];
  onSortChange: (columnId: string) => void;
  search: string;
  sort?: DataTableSort;
};

export function TeamTable({
  footer,
  items,
  onSortChange,
  search,
  sort,
}: TeamTableProps) {
  const columns: readonly DataTableColumn<Team>[] = [
    {
      header: "id",
      id: "team-id",
      sortable: true,
      width: { type: "fixed", value: 120 },
      renderCell: (team) => team.id,
    },
    {
      header: "チーム名",
      id: "team-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (team) => (
        <Link
          className="text-text-base hover:underline"
          to={`/teams/${team.id}${search}`}
        >
          {team.name}
        </Link>
      ),
    },
    {
      header: "登録クラス",
      id: "registered-classes",
      width: { type: "fluid", min: 220, grow: 2 },
      renderCell: (team) =>
        team.registeredClasses.length > 0
          ? team.registeredClasses.join("・")
          : "-",
    },
    {
      header: "更新日時",
      id: "updated-at",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (team) => formatDisplayDateTime(team.updatedAt),
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (team) => <TeamActionMenu search={search} team={team} />,
    },
  ];

  return (
    <DataTable
      ariaLabel="チーム一覧"
      columns={columns}
      emptyMessage="表示するチームがありません。"
      footer={footer}
      getRowKey={(team) => team.id}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
