import { MoreHorizontal, Search } from "lucide-react";
import { Link } from "react-router";
import { useTeacherSearch } from "~/features/teachers/application/useTeacherSearch";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

export function TeachersPage({ teachers }: { teachers: TeacherRow[] }) {
  const { filteredTeachers, query, setQuery } = useTeacherSearch(teachers);

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">ユーザー管理（教官）</h1>
      <p className="mt-1 text-xs text-black/40">
        学生・クラス・教官の基本情報を管理します
      </p>
      <div className="mt-5">
        <ImportUploadTrigger
          type="teachers"
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
        <Link
          to="/classroom"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          クラス
        </Link>
        <span className="rounded-[10px] border border-[#0070bb] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white">
          教官
        </span>
      </div>
      <label className="mt-4 flex h-[38px] w-full max-w-[260px] items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm">
        <Search className="size-4 text-black/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 outline-none"
          placeholder="氏名・クラス名で検索..."
        />
      </label>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {["教官ID", "教官名", "担当クラス", "操作"].map((h) => (
                <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher) => (
              <tr
                key={teacher.teacherId}
                className="border-b border-[#d2d2d2] last:border-b-0"
              >
                <td className="px-4 py-3">{teacher.teacherId}</td>
                <td className="px-4 py-3">{teacher.displayName}</td>
                <td className="px-4 py-3 whitespace-pre-line">
                  {teacher.classRooms.length > 0
                    ? teacher.classRooms.map((c) => c.className).join("\n")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/teachers/${teacher.teacherId}`}
                    aria-label={`${teacher.displayName}の詳細・操作`}
                    className="text-black/45"
                  >
                    <MoreHorizontal className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredTeachers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-xs text-black/40"
                >
                  該当する教官が見つかりません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
