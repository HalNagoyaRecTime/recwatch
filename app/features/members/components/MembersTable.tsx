import type { Student } from "~/features/members/model/student";

export function MembersTable({ students }: { students: Student[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-1)]">
      <table className="w-full text-sm text-[var(--text-1)]">
        <thead className="border-b border-b-[var(--border-2)] bg-[var(--surface-2)] text-left text-xs font-medium text-[var(--text-2)] uppercase">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">表示名</th>
            <th className="px-4 py-3">学籍番号</th>
            <th className="px-4 py-3">出席番号</th>
            <th className="px-4 py-3">学籍番号（数字）</th>
            <th className="px-4 py-3">UID</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface-1)]">
          {students.map((s) => (
            <tr
              key={s.id}
              className="border-t border-t-[var(--border-1)] hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-3">{s.id}</td>
              <td className="px-4 py-3">{s.display_name}</td>
              <td className="px-4 py-3">{s.student_id}</td>
              <td className="px-4 py-3">{s.attendance_number}</td>
              <td className="px-4 py-3">{s.student_id_number}</td>
              <td className="px-4 py-3">{s.uid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
