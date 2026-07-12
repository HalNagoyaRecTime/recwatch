import type { CompetitionData } from "~/features/sports/model/competition";
import { CompetitionTable } from "~/features/sports/components/CompetitionTable";

export function CompetitionListPage({
  competitions,
}: {
  competitions: CompetitionData[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-[var(--text-1)]">競技一覧</h1>
      <CompetitionTable competitions={competitions} />
    </div>
  );
}
