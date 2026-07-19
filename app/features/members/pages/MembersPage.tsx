import { Ban, Pencil, Search, Trash2, Upload } from "lucide-react";
import { Link } from "react-router";

const students = [
  ["0001", "IA00A000", "01", "山田 花子", "クラスA"],
  ["0002", "IA00A001", "02", "鈴木 一郎", "クラスB"],
  ["0003", "IA00A002", "03", "田中 次郎", "クラスC"],
] as const;

export function MembersPage() {
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">ユーザー管理</h1>
      <p className="mt-1 text-xs text-black/40">
        学生・クラス・教官の基本情報を管理します
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          to="/members/import"
          className="flex items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm"
        >
          <Upload className="size-4" /> CSV / Excel を取り込む
        </Link>
        <span className="text-xs text-black/40">
          取り込み前にプレビューで内容を確認できます
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="rounded-[10px] border border-[#0070bb] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white">
          学生
        </span>
        <Link
          to="/homeroom"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          クラス
        </Link>
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
          placeholder="氏名・クラスで検索..."
        />
      </label>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {[
                "通し番号",
                "学籍番号",
                "出席番号",
                "氏名",
                "クラス",
                "操作",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-[#d2d2d2] px-4 py-2"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student[0]}
                className="border-b border-[#d2d2d2] last:border-b-0"
              >
                {student.map((cell) => (
                  <td key={cell} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex gap-3 text-black/45">
                    <button type="button" aria-label={`${student[3]}を編集`}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" aria-label={`${student[3]}を削除`}>
                      <Trash2 className="size-4" />
                    </button>
                    <button type="button" aria-label={`${student[3]}を無効化`}>
                      <Ban className="size-4" />
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
