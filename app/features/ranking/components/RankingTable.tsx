import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { RankingActionMenu } from "~/features/ranking/components/RankingActionMenu";
import type { Ranking } from "~/features/ranking/model/ranking";

type RankingTableProps = {
  footer?: import("react").ReactNode;
  items: readonly Ranking[];
  onToggleTeam: (teamId: number) => void;
  selectedTeamIds: ReadonlySet<number>;
};

export function RankingTable({
  footer,
  items,
  onToggleTeam,
  selectedTeamIds,
}: RankingTableProps) {
  const columns: readonly DataTableColumn<Ranking>[] = [
    {
      align: "center",
      header: "",
      id: "select",
      width: { type: "fixed", value: 48 },
      renderCell: (ranking) => (
        <input
          aria-label={`${ranking.teamName}を選択`}
          checked={selectedTeamIds.has(ranking.teamId)}
          className="accent-brand-primary size-4"
          onChange={() => onToggleTeam(ranking.teamId)}
          type="checkbox"
        />
      ),
    },
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
      renderCell: (ranking) => `${ranking.score} 点`,
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
