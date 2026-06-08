import type { Student } from "~/features/members/model/student";

export function MembersTable({ students }: { students: Student[] }) {
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
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">DISPLAY_NAME</th>
            <th className="px-4 py-3">UID</th>
          </tr>
        </thead>
        <tbody style={{ background: "var(--surface-1)" }}>
          {students.map((s) => (
            <tr
              key={s.id}
              style={{ borderTop: "1px solid var(--border-1)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--surface-2)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "")
              }
            >
              <td className="px-4 py-3">{s.display_name}</td>
              <td className="px-4 py-3">{s.id}</td>
              <td className="px-4 py-3">{s.uid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
