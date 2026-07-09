import type { HomeroomData } from "~/features/homeroom/model/homeroom";

export function HomeroomTable({ homerooms }: { homerooms: HomeroomData[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-1)]">
      <table className="w-full text-sm text-[var(--text-1)]">
        <thead className="border-b border-b-[var(--border-2)] bg-[var(--surface-2)] text-left text-xs">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">HomeroomCode</th>
            <th className="px-4 py-3">HomeroomName</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface-1)]">
          {homerooms.map((homeroom) => (
            <tr
              key={homeroom.HomeroomId}
              className="border-t border-t-[var(--border-1)] hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-3">{homeroom.HomeroomId}</td>
              <td className="px-4 py-3">{homeroom.HomeroomCode}</td>
              <td className="px-4 py-3">{homeroom.HomeroomName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
