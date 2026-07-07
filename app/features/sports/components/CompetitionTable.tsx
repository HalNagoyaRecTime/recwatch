import type { CompetitionData } from "~/features/sports/model/competition";

export function CompetitionTable({
  competitions,
}: {
  competitions: CompetitionData[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-1)]">
      <table className="w-full text-sm text-[var(--text-1)]">
        <thead className="border-b border-b-[var(--border-2)] bg-[var(--surface-2)] text-left text-xs">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">競技名</th>
            <th className="px-4 py-3">場所</th>
            <th className="px-4 py-3">開始時間</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface-1)]">
          {competitions.map((competition) => (
            <tr
              key={competition.CompetitionId}
              className="border-t border-t-[var(--border-1)] hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-3">{competition.CompetitionId}</td>
              <td className="px-4 py-3">{competition.CompetitionName}</td>
              <td className="px-4 py-3">{competition.Venue}</td>
              <td className="px-4 py-3">{competition.StartTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
