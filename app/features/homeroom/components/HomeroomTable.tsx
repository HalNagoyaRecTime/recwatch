import type { HomeRoomData } from "~/features/homeroom/model/homeroom";

export function HomeRoomTable({ homerooms }: { homerooms: HomeRoomData[] }) {
  return (
    <div
      className="overflow-x-auto rounded-lg"
      style={{ border: "1px solid var(--border-1)" }}
    >
      <table className="w-full text-sm" style={{ color: "var(--text-1)" }}>
        <thead
          className="text-left text-xs font-medium uppercase"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-2)",
            borderBottom: "1px solid var(--border-2)",
          }}
        >
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">HomeroomCode</th>
            <th className="p-3">HomeroomName</th>
          </tr>
        </thead>
        <tbody style={{ borderBottom: "1px solid var(--surface-1)" }}>
          {homerooms.map((homeroom) => (
            <tr
              key={homeroom.HomeRoomId}
              style={{ borderTop: "1px solid var(--surface-1)" }}
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
