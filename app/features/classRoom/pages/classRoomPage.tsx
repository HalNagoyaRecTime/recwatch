import { Ban, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

import type { classRoomData } from "~/features/classRoom/model/classRoom";

export function ClassRoomPage({ classRooms }: { classRooms: classRoomData[] }) {
  const [query, setQuery] = useState("");

  const filteredClassRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return classRooms;
    return classRooms.filter((classRoom) =>
      classRoom.ClassRoomName.toLowerCase().includes(normalizedQuery)
    );
  }, [query, classRooms]);

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">マスターデータ管理</h1>
      <p className="mt-1 text-xs text-black/40">
        学生・クラス・教官の基本情報を管理します
      </p>
      <div className="mt-5">
        <ImportUploadTrigger
          type="classrooms"
          helperText="取り込み前にプレビューで内容・データ種別を確認できます"
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          to="/members"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          学生
        </Link>
        <span className="rounded-[10px] border border-[#0070bb] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white">
          クラス
        </span>
        <Link
          to="/instructors"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          教官
        </Link>
      </div>
      <label className="mt-4 flex h-[38px] w-full max-w-[240px] items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm">
        <Search className="size-4 text-black/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="クラスを検索"
          className="min-w-0 flex-1 outline-none"
          placeholder="クラス名・担任で検索..."
        />
      </label>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {["通し番号", "クラスID", "クラス名", "学生数", "操作"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="border-b border-[#d2d2d2] px-4 py-2"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredClassRooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-black/40">
                  クラスが見つかりません
                </td>
              </tr>
            ) : (
              filteredClassRooms.map((classRoom, index) => (
                <tr
                  key={classRoom.ClassRoomId}
                  className="border-b border-[#d2d2d2] last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {String(index + 1).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3">{classRoom.ClassRoomCode}</td>
                  <td className="px-4 py-3">{classRoom.ClassRoomName}</td>
                  <td className="px-4 py-3">{classRoom.StudentCount}名</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-black/45">
                      <button
                        type="button"
                        aria-label={`${classRoom.ClassRoomName}を編集`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${classRoom.ClassRoomName}を無効化`}
                      >
                        <Ban className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${classRoom.ClassRoomName}を削除`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
