import { MoreHorizontal, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { TeacherRow } from "~/features/instructors/model/teacher";

export function InstructorsPage({ teachers }: { teachers: TeacherRow[] }) {
  const [query, setQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return teachers;

    return teachers.filter((teacher) => {
      const haystack = [
        teacher.displayName,
        ...teacher.classRooms.map((c) => c.className),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [teachers, query]);

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">ユーザー管理（教官）</h1>
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
          placeholder="クラス名・担任で検索..."
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
                <td className="px-4 py-3">{teacher.teacherCode}</td>
                <td className="px-4 py-3">{teacher.displayName}</td>
                <td className="px-4 py-3 whitespace-pre-line">
                  {teacher.classRooms.length > 0
                    ? teacher.classRooms.map((c) => c.className).join("\n")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/instructors/${teacher.teacherId}`}
                    aria-label={`${teacher.displayName}の詳細・操作`}
                    className="inline-flex size-7 items-center justify-center rounded-md text-black/45 hover:bg-[#f2f4f7]"
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
