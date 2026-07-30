import type { ClassRoomData } from "~/features/classRoom/model/classRoom";

export function ClassRoomTable({
  classRooms,
}: {
  classRooms: ClassRoomData[];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-[#f9fafb] text-[11px] text-black/50">
          <tr>
            <th className="border-b border-[#d2d2d2] px-4 py-2">
              <span className="sr-only">番号</span>
            </th>
            <th className="border-b border-[#d2d2d2] px-4 py-2">クラス記号</th>
            <th className="border-b border-[#d2d2d2] px-4 py-2">教官名</th>
            <th className="border-b border-[#d2d2d2] px-4 py-2">学生数</th>
          </tr>
        </thead>
        <tbody>
          {classRooms.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-xs text-black/40"
              >
                該当するクラスが見つかりません。
              </td>
            </tr>
          ) : (
            classRooms.map((classRoom, index) => (
              <tr
                key={classRoom.classRoomId}
                className="border-b border-[#d2d2d2] last:border-b-0"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{classRoom.classRoomCode}</td>
                <td className="px-4 py-3">
                  {classRoom.teacherName ?? "未設定"}
                </td>
                <td className="px-4 py-3">{classRoom.studentCount}名</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
