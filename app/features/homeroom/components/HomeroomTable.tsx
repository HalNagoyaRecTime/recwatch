import type { HomeRoomData } from "~/features/homeroom/model/homeroom";

export function HomeRoomTable({ homerooms }: { homerooms: HomeRoomData[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-1)]">
      <table className="w-full text-sm text-[var(--text-1)]">
        <thead className="border-b border-b-[var(--border-2)] bg-[var(--surface-2)]">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">HomeroomCode</th>
            <th className="p-3">HomeroomName</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface-1)]">
          {homerooms.map((homeroom) => (
            <tr
              key={homeroom.HomeRoomId}
              className="border-t border-t-[var(--border-1)] hover:bg-[var(--surface-2)]"
            >
              <td className="p-3">{homeroom.HomeRoomId}</td>
              <td className="p-3">{homeroom.HomeRoomCode}</td>
              <td className="p-3">{homeroom.HomeRoomName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
