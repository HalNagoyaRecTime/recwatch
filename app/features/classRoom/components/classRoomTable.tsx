import type { classRoomData } from "~/features/classRoom/model/classRoom";

export function ClassRoomTable({
  classRooms,
}: {
  classRooms: classRoomData[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-1)]">
      <table className="w-full text-sm text-[var(--text-1)]">
        <thead className="border-b border-b-[var(--border-2)] bg-[var(--surface-2)] text-left text-xs">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">ClassCode</th>
            <th className="px-4 py-3">ClassName</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface-1)]">
          {classRooms.map((classRoom) => (
            <tr
              key={classRoom.ClassRoomId}
              className="border-t border-t-[var(--border-1)] hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-3">{classRoom.ClassRoomId}</td>
              <td className="px-4 py-3">{classRoom.ClassRoomCode}</td>
              <td className="px-4 py-3">{classRoom.ClassRoomName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
