import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { RankingActionMenu } from "~/features/ranking/components/RankingActionMenu";
import type { Ranking } from "~/features/ranking/model/ranking";
import { formatDisplayDateTime } from "~/lib/format-display-date-time";

type RankingTableProps = {
  footer?: import("react").ReactNode;
  items: readonly Ranking[];
};

export function RankingTable({ footer, items }: RankingTableProps) {
  const columns: readonly DataTableColumn<Ranking>[] = [
    {
      header: "順位",
      id: "rank",
      width: { type: "fixed", value: 100 },
      renderCell: (ranking) => ranking.rank,
    },
    {
      header: "チーム名",
      id: "team-name",
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (ranking) => ranking.teamName,
    },
    {
      header: "スコア",
      id: "score",
      width: { type: "fixed", value: 140 },
      renderCell: (ranking) => `${ranking.score} pt`,
    },
    {
      header: "更新日時",
      id: "updated-at",
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (ranking) => formatDisplayDateTime(ranking.updatedAt),
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (ranking) => <RankingActionMenu ranking={ranking} />,
    },
  ];

  return (
    <DataTable
      ariaLabel="ランキング一覧"
      columns={columns}
      emptyMessage="表示するランキングがありません。"
      footer={footer}
      getRowKey={(ranking) => ranking.teamId}
      items={items}
    />
  );
}
