import { Ban, Pencil, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { StudentApi, type StudentDTO } from "~/features/members/api";
import { parseStudentImportFile } from "~/features/members/lib/parseStudentImportFile";

export function MembersPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const page = await StudentApi.getStudents();
        if (!isCurrent) return;
        setStudents(page.students);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "学生一覧の取得に失敗しました。"
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

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students;
    return students.filter(
      (student) =>
        student.display_name.toLowerCase().includes(normalizedQuery) ||
        student.class_room_name.toLowerCase().includes(normalizedQuery)
    );
  }, [query, students]);

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const parsed = await parseStudentImportFile(file);
      navigate("/members/import", {
        state: { fileName: file.name, ...parsed },
      });
    } catch (error) {
      setParseError(
        error instanceof Error
          ? error.message
          : "ファイルの読み込みに失敗しました。"
      );
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">ユーザー管理</h1>
      <p className="mt-1 text-xs text-black/40">
        学生・クラス・教官の基本情報を管理します
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => void handleFileSelected(e)}
        />
        <button
          type="button"
          disabled={isParsing}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          <Upload className="size-4" />
          {isParsing ? "読み込み中..." : "CSV / Excel を取り込む"}
        </button>
        <span className="text-xs text-black/40">
          取り込み前にプレビューで内容を確認できます
        </span>
      </div>
      {parseError ? (
        <p className="mt-2 max-w-xl rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {parseError}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <span className="rounded-[10px] border border-[#0070bb] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white">
          学生
        </span>
        <Link
          to="/classroom"
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 outline-none"
          placeholder="氏名・クラスで検索..."
        />
      </label>
      {loadError ? (
        <p className="mt-2 max-w-xl rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </p>
      ) : null}
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-black/40">
                  読み込み中...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-black/40">
                  学生が見つかりません
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => (
                <tr
                  key={student.student_id}
                  className="border-b border-[#d2d2d2] last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {String(index + 1).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3">{student.student_id_number}</td>
                  <td className="px-4 py-3">
                    {String(student.attendance_number).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">{student.display_name}</td>
                  <td className="px-4 py-3">{student.class_room_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-black/45">
                      <button
                        type="button"
                        aria-label={`${student.display_name}を編集`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${student.display_name}を削除`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${student.display_name}を無効化`}
                      >
                        <Ban className="size-4" />
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
