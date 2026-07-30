import { AlertTriangle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  StudentImportApi,
  type StudentImportRowError,
} from "~/features/members/api";
import type { StudentImportNavigationState } from "~/features/members/lib/parseStudentImportFile";

const REASON_LABELS: Record<StudentImportRowError["reason"], string> = {
  student_id_number_duplicate_in_file: "ファイル内で学籍番号が重複しています",
  student_id_number_duplicate_in_db: "登録済みの学籍番号と重複しています",
};

type PageStatus = "validating" | "reviewing" | "committing" | "done";

export function MembersImportConfirmationPage() {
  const location = useLocation();
  const state = location.state as StudentImportNavigationState | null;

  const needsValidation =
    !!state && state.formatErrors.length === 0 && state.rows.length > 0;

  const [status, setStatus] = useState<PageStatus>(
    needsValidation ? "validating" : "reviewing"
  );
  const [rowErrors, setRowErrors] = useState<
    Map<number, StudentImportRowError>
  >(new Map());
  const [errorCount, setErrorCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!needsValidation || !state) return;

    let isCurrent = true;

    async function validate() {
      try {
        const result = await StudentImportApi.validate(state!.rows);
        if (!isCurrent) return;
        setRowErrors(new Map(result.errors.map((e) => [e.row_index, e])));
        setErrorCount(result.error_count);
      } catch (error) {
        if (!isCurrent) return;
        setApiError(
          error instanceof Error ? error.message : "検証に失敗しました。"
        );
      } finally {
        if (isCurrent) setStatus("reviewing");
      }
    }

    void validate();
    return () => {
      isCurrent = false;
    };
  }, [needsValidation, state]);

  async function handleCommit() {
    if (!state) return;

    setStatus("committing");
    setApiError(null);

    try {
      const result = await StudentImportApi.commit(state.rows);
      if (result.error_count > 0) {
        setRowErrors(new Map(result.errors.map((e) => [e.row_index, e])));
        setErrorCount(result.error_count);
        setApiError(
          "登録時にエラーが発生したため、1件も登録されませんでした。内容を確認してください。"
        );
        setStatus("reviewing");
        return;
      }

      setImportedCount(result.imported);
      setStatus("done");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "登録に失敗しました。"
      );
      setStatus("reviewing");
    }
  }

  if (!state) {
    return (
      <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
        <h1 className="text-[17px] font-bold">取り込み確認</h1>
        <p className="mt-4 text-sm text-black/60">
          取り込むファイルが選択されていません。ユーザー管理画面から「CSV /
          Excel を取り込む」を選択してください。
        </p>
        <Link
          to="/members"
          className="mt-4 inline-block rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
        >
          戻る
        </Link>
      </div>
    );
  }

  if (status === "done" && importedCount !== null) {
    return (
      <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
        <h1 className="text-[17px] font-bold">取り込み完了</h1>
        <p className="mt-4 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {importedCount.toLocaleString()}件の学生を登録しました。
        </p>
        <Link
          to="/members"
          className="mt-4 inline-block rounded-[10px] bg-[#0070bb] px-5 py-2 text-sm text-white"
        >
          ユーザー管理に戻る
        </Link>
      </div>
    );
  }

  const hasFormatErrors = state.formatErrors.length > 0;
  const canCommit =
    !hasFormatErrors &&
    errorCount === 0 &&
    state.rows.length > 0 &&
    status === "reviewing";

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">取り込み確認</h1>
      <p className="mt-1 text-xs text-black/40">
        以下の内容を登録します。問題なければ「登録する」を押してください。
      </p>

      <div className="mt-4 flex h-16 w-40 flex-col items-center justify-center rounded-[14px] border border-[#d2d2d2] bg-white">
        <span className="text-xs text-black/40">取り込み件数</span>
        <strong className="mt-1 text-xl">
          {state.rows.length.toLocaleString()}件
        </strong>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span>
          ファイル：<strong>{state.fileName}</strong>
        </span>
        <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-xs text-[#1447e6]">
          データ種別：学生
        </span>
      </div>

      {status === "validating" ? (
        <p className="mt-4 text-sm text-black/50">検証しています...</p>
      ) : null}

      {apiError ? (
        <p className="mt-4 flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="size-4 shrink-0" />
          {apiError}
        </p>
      ) : null}

      {hasFormatErrors ? (
        <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-bold">
            {state.formatErrors.length}
            行のデータ形式に問題があります。ファイルを修正して再度取り込んでください。
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {state.formatErrors.slice(0, 20).map((e) => (
              <li key={e.rowNumber}>
                {e.rowNumber}行目: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasFormatErrors && errorCount > 0 ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorCount}
          件のエラーがあるため登録できません。内容を確認し、修正したファイルを再度取り込んでください。
        </p>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
        <div className="max-h-[330px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-[#f9fafb] text-[11px] text-black/50">
              <tr>
                {[
                  "通し番号",
                  "学籍番号",
                  "出席番号",
                  "氏名",
                  "クラス",
                  "状態",
                ].map((h) => (
                  <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row, index) => {
                const rowError = rowErrors.get(index);
                return (
                  <tr
                    key={index}
                    className={`border-b border-[#d2d2d2] even:bg-[#fafbfd] ${
                      rowError ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{row.student_id_number}</td>
                    <td className="px-4 py-2">{row.attendance_number}</td>
                    <td className="px-4 py-2">
                      {row.last_name}
                      {row.first_name}
                    </td>
                    <td className="px-4 py-2">{row.class_code}</td>
                    <td className="px-4 py-2">
                      {rowError ? (
                        <span className="text-xs text-red-600">
                          {REASON_LABELS[rowError.reason]}
                        </span>
                      ) : (
                        <span className="text-xs text-black/40">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          to="/members"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
        >
          戻る
        </Link>
        <button
          type="button"
          disabled={!canCommit}
          onClick={() => void handleCommit()}
          className="flex items-center gap-2 rounded-[10px] bg-[#0070bb] px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          <Check className="size-4" />
          {status === "committing"
            ? "登録中..."
            : `登録する（${state.rows.length.toLocaleString()}件）`}
        </button>
      </div>
    </div>
  );
}
