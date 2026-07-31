import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  masterImportApi,
  type MasterImportSessionDTO,
} from "~/features/master-import/api";
import {
  MASTER_IMPORT_COLUMN_LABEL,
  MASTER_IMPORT_ERROR_REASON_LABEL,
  MASTER_IMPORT_LIST_PATH,
  MASTER_IMPORT_TYPE_LABEL,
} from "~/features/master-import/constants";

const PAGE_SIZE = 25;

export function MembersImportConfirmationPage() {
  const [searchParams] = useSearchParams();
  const importId = searchParams.get("importId");

  const [session, setSession] = useState<MasterImportSessionDTO | null>(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  useEffect(() => {
    if (!importId) {
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    setLoadError(null);

    masterImportApi
      .get(importId, { offset, limit: PAGE_SIZE })
      .then((result) => {
        if (!isCurrent) return;
        setSession(result);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "取り込み内容の取得に失敗しました。"
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [importId, offset]);

  const columns = useMemo(() => {
    const firstRow = session?.rows[0];
    return firstRow ? Object.keys(firstRow) : [];
  }, [session]);

  const listPath = session ? MASTER_IMPORT_LIST_PATH[session.type] : "/members";

  async function handleCommit() {
    if (!importId) return;
    setIsCommitting(true);
    setCommitError(null);
    try {
      const result = await masterImportApi.commit(importId);
      setSession(result);
    } catch (error) {
      setCommitError(
        error instanceof Error ? error.message : "登録に失敗しました。"
      );
    } finally {
      setIsCommitting(false);
    }
  }

  if (!importId) {
    return (
      <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
        <p className="text-sm text-black/60">
          取り込み対象が指定されていません。
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

  if (isLoading && !session) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f7faff] p-1">
        <Loader2 className="size-6 animate-spin text-black/40" />
      </div>
    );
  }

  if (loadError && !session) {
    return (
      <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
        <p className="text-sm text-red-600">{loadError}</p>
        <Link
          to="/members"
          className="mt-4 inline-block rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
        >
          戻る
        </Link>
      </div>
    );
  }

  if (!session) return null;

  const isCommitted = session.status === "committed";
  const hasErrors = session.error_count > 0;
  const rangeStart = session.rows_total === 0 ? 0 : session.rows_offset + 1;
  const rangeEnd = Math.min(
    session.rows_offset + session.rows_limit,
    session.rows_total
  );

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">
        {isCommitted ? "取り込み完了" : "取り込み確認"}
      </h1>
      <p className="mt-1 text-xs text-black/40">
        {isCommitted
          ? "登録が完了しました。"
          : "以下の内容を登録します。問題なければ「登録する」を押してください。"}
      </p>
      <div className="mt-4 flex h-16 w-40 flex-col items-center justify-center rounded-[14px] border border-[#d2d2d2] bg-white">
        <span className="text-xs text-black/40">取り込み件数</span>
        <strong className="mt-1 text-xl">
          {session.total.toLocaleString()}件
        </strong>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span>
          ファイル：<strong>{session.file_name}</strong>
        </span>
        <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-xs text-[#1447e6]">
          データ種別：{MASTER_IMPORT_TYPE_LABEL[session.type]}
        </span>
      </div>

      {hasErrors && (
        <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="size-4" />
            {session.error_count}
            件のエラーがあります。修正したファイルを再度取り込んでください。
          </div>
          <ul className="mt-2 max-h-60 list-disc space-y-1 overflow-y-auto pl-5 text-xs">
            {session.errors.map((error, index) => (
              <li key={index}>
                {error.row_index + 1}行目：
                {MASTER_IMPORT_ERROR_REASON_LABEL[error.reason] ?? error.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {commitError && (
        <p className="mt-4 text-sm text-red-600">{commitError}</p>
      )}

      {isCommitted && session.committed_result && (
        <p className="mt-4 text-sm text-[#0070bb]">
          {session.committed_result.imported.toLocaleString()}
          件を登録しました。
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
        <div className="max-h-[330px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-[#f9fafb] text-[11px] text-black/50">
              <tr>
                {columns.map((key) => (
                  <th key={key} className="border-b border-[#d2d2d2] px-4 py-2">
                    {MASTER_IMPORT_COLUMN_LABEL[key] ?? key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {session.rows.map((row, index) => (
                <tr
                  key={session.rows_offset + index}
                  className="border-b border-[#d2d2d2] even:bg-[#fafbfd]"
                >
                  {columns.map((key) => (
                    <td key={key} className="px-4 py-2">
                      {String(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d2d2d2] px-4 py-3 text-xs text-black/50">
          <span>
            {session.rows_total.toLocaleString()}件中 {rangeStart}〜{rangeEnd}
            件を表示
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={offset === 0 || isLoading}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="rounded border px-2 py-1 disabled:opacity-30"
            >
              ‹ 前へ
            </button>
            <button
              type="button"
              disabled={rangeEnd >= session.rows_total || isLoading}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="rounded border bg-white px-2 py-1 disabled:opacity-30"
            >
              次へ ›
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Link
          to={listPath}
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
        >
          {isCommitted ? "一覧に戻る" : "戻る"}
        </Link>
        {!isCommitted && (
          <button
            type="button"
            disabled={hasErrors || isCommitting}
            onClick={() => void handleCommit()}
            className="flex items-center gap-2 rounded-[10px] bg-[#0070bb] px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {isCommitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            登録する（{session.total.toLocaleString()}件）
          </button>
        )}
      </div>
    </div>
  );
}
