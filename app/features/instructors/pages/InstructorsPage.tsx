import { Ban, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { TeacherApi, type TeacherDTO } from "~/features/instructors/api";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

export function InstructorsPage() {
  const [instructors, setInstructors] = useState<TeacherDTO[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const allTeachers = await TeacherApi.getAllTeachers();
        if (!isCurrent) return;
        setInstructors(allTeachers);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "教官一覧の取得に失敗しました。"
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredInstructors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return instructors;
    return instructors.filter(
      (instructor) =>
        instructor.display_name.toLowerCase().includes(normalizedQuery) ||
        instructor.class_rooms.some((c) =>
          c.class_name.toLowerCase().includes(normalizedQuery)
        )
    );
  }, [query, instructors]);

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">マスターデータ管理</h1>
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
      {loadError ? (
        <p className="mt-2 max-w-xl rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </p>
      ) : null}
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {["通し番号", "教官ID", "氏名", "担当クラス", "操作"].map((h) => (
                <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-black/40">
                  読み込み中...
                </td>
              </tr>
            ) : filteredInstructors.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-black/40">
                  教官が見つかりません
                </td>
              </tr>
            ) : (
              filteredInstructors.map((instructor, index) => (
                <tr
                  key={instructor.teacher_id}
                  className="border-b border-[#d2d2d2] last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {String(index + 1).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3">{instructor.teacher_id}</td>
                  <td className="px-4 py-3">{instructor.display_name}</td>
                  <td className="px-4 py-3">
                    {instructor.class_rooms.length > 0
                      ? instructor.class_rooms
                          .map((c) => c.class_name)
                          .join("、")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-black/45">
                      <button type="button" aria-label="編集">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" aria-label="無効化">
                        <Ban className="size-4" />
                      </button>
                      <button type="button" aria-label="削除">
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
