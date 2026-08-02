import { Ban, Pencil, Search, Trash2, Upload } from "lucide-react";
import { Link } from "react-router";

const classRooms = [
  ["0001", "IH12A", "IH12A203", "32名"],
  ["0002", "IH12B", "IH12B203", "31名"],
  ["0003", "IA14A", "IA14A203", "20名"],
  ["0004", "PI12A", "PI12A203", "25名"],
] as const;

export function ClassRoomPage() {
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">マスターデータ管理</h1>
      <p className="mt-1 text-xs text-black/40">
        学生・クラス・教官の基本情報を管理します
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm"
        >
          <Upload className="size-4" />
          CSV / Excel を取り込む
        </button>
        <span className="text-xs text-black/40">
          取り込み前にプレビューで内容・データ種別を確認できます
        </span>
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
            {classRooms.map((classRoom) => (
              <tr
                key={classRoom[0]}
                className="border-b border-[#d2d2d2] last:border-b-0"
              >
                {classRoom.map((cell) => (
                  <td key={cell} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex gap-3 text-black/45">
                    <button type="button" aria-label={`${classRoom[2]}を編集`}>
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${classRoom[2]}を無効化`}
                    >
                      <Ban className="size-4" />
                    </button>
                    <button type="button" aria-label={`${classRoom[2]}を削除`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
