import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { FormModal } from "~/components/ui/modal/FormModal";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";
import {
  masterImportApi,
  type MasterImportSession,
} from "~/features/master-import/api";
import { ImportPreviewTable } from "~/features/master-import/components/ImportPreviewTable";
import {
  MASTER_IMPORT_ERROR_REASON_LABEL,
  MASTER_IMPORT_LIST_PATH,
  MASTER_IMPORT_TYPE_LABEL,
} from "~/features/master-import/constants";
import { formatMasterImportExpiration } from "~/features/master-import/format-master-import-expiration";

const PAGE_SIZE = 25;

export function MembersImportConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const importId = searchParams.get("importId");
  const [session, setSession] = useState<MasterImportSession | null>(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(importId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  useEffect(() => {
    if (!importId) return;

    let active = true;

    masterImportApi
      .get(importId, { offset, limit: PAGE_SIZE })
      .then((result) => {
        if (active) setSession(result);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "取り込み内容の取得に失敗しました。"
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [importId, offset]);

  const columns = useMemo(() => {
    const firstRow = session?.rows[0];
    return firstRow ? Object.keys(firstRow) : [];
  }, [session]);
  const listPath = session ? MASTER_IMPORT_LIST_PATH[session.type] : "/members";
  const isSessionLoading =
    Boolean(importId) && (isLoading || session?.importId !== importId);

  function changePage(nextOffset: number) {
    setIsLoading(true);
    setLoadError(null);
    setOffset(nextOffset);
  }

  async function commitImport() {
    if (!importId || isCommitting) return;
    setIsCommitting(true);
    setCommitError(null);
    try {
      setSession(await masterImportApi.commit(importId));
    } catch (error) {
      setCommitError(
        error instanceof Error ? error.message : "登録に失敗しました。"
      );
    } finally {
      setIsCommitting(false);
    }
  }

  const isCommitted = session?.status === "committed";
  const hasValidationErrors = Boolean(session?.errorCount);
  const title = hasValidationErrors
    ? `${session?.errorCount ?? 0}件のエラーがあります`
    : isCommitted
      ? "取り込み完了"
      : "取り込み確認";
  const description = hasValidationErrors
    ? "修正したファイルを再度取り込んでください。"
    : isCommitted
      ? "登録が完了しました。"
      : "検証済みの内容を確認してから登録します";

  return (
    <FormModal
      description={description}
      onClose={() => navigate(listPath)}
      size="xl"
      title={title}
    >
      {!importId ? (
        <EmptyImportState message="取り込み対象が指定されていません。" />
      ) : isSessionLoading && !session ? (
        <div
          className="text-text-muted flex min-h-48 items-center justify-center gap-2 text-sm"
          role="status"
        >
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          取り込み内容を読み込んでいます...
        </div>
      ) : loadError && !session ? (
        <EmptyImportState message={loadError} />
      ) : session ? (
        <ImportSessionContent
          columns={columns}
          commitError={commitError}
          isCommitting={isCommitting}
          isLoading={isSessionLoading}
          listPath={listPath}
          onCommit={() => void commitImport()}
          onNext={() => changePage(offset + PAGE_SIZE)}
          onPrevious={() => changePage(Math.max(0, offset - PAGE_SIZE))}
          session={session}
        />
      ) : null}
    </FormModal>
  );
}

function ImportSessionContent({
  columns,
  commitError,
  isCommitting,
  isLoading,
  listPath,
  onCommit,
  onNext,
  onPrevious,
  session,
}: {
  columns: readonly string[];
  commitError: string | null;
  isCommitting: boolean;
  isLoading: boolean;
  listPath: string;
  onCommit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  session: MasterImportSession;
}) {
  const isCommitted = session.status === "committed";
  const hasErrors = session.errorCount > 0;
  const rangeStart = session.rowsTotal === 0 ? 0 : session.rowsOffset + 1;
  const rangeEnd = Math.min(
    session.rowsOffset + session.rowsLimit,
    session.rowsTotal
  );

  return (
    <div className="space-y-5">
      <dl className="border-border-subtle grid gap-4 border-b pb-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryValue
          label="取り込み件数"
          value={`${session.total.toLocaleString()}件`}
        />
        <SummaryValue label="ファイル" value={session.fileName} />
        <SummaryValue
          label="データ種別"
          value={MASTER_IMPORT_TYPE_LABEL[session.type]}
        />
        <SummaryValue
          label="確認期限"
          value={formatMasterImportExpiration(session.expiresAt)}
        />
      </dl>

      {hasErrors ? (
        <div
          className="text-tone-danger-text flex items-start gap-3"
          role="alert"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
          />
          <ul className="max-h-48 min-w-0 flex-1 space-y-2 overflow-y-auto text-sm">
            {session.errors.map((error, index) => (
              <li key={`${error.rowIndex}-${index}`}>
                {error.rowIndex + 1}行目：
                {MASTER_IMPORT_ERROR_REASON_LABEL[error.reason] ?? error.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {commitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {commitError}
        </p>
      ) : null}

      {isCommitted && session.committedResult ? (
        <p className="text-tone-success-text text-sm" role="status">
          {session.committedResult.imported.toLocaleString()}件を登録しました。
        </p>
      ) : null}

      <ImportPreviewTable
        columns={columns}
        isLoading={isLoading}
        onNext={onNext}
        onPrevious={onPrevious}
        rangeEnd={rangeEnd}
        rangeStart={rangeStart}
        rows={session.rows}
        rowsOffset={session.rowsOffset}
        rowsTotal={session.rowsTotal}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {hasErrors ? (
            <span className="text-tone-danger-text text-sm font-medium">
              エラーを修正して再度取り込んでください
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <ButtonLink to={listPath} variant="secondary">
            {isCommitted ? "一覧に戻る" : "戻る"}
          </ButtonLink>
          {!isCommitted ? (
            <Button
              disabled={hasErrors || isCommitting}
              icon={Check}
              onClick={onCommit}
              variant="primary"
            >
              {isCommitting
                ? "登録中..."
                : `登録する（${session.total.toLocaleString()}件）`}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-text-subtle text-xs">{label}</dt>
      <dd className="text-text-base mt-1 truncate text-sm font-semibold">
        {value}
      </dd>
    </div>
  );
}

function EmptyImportState({ message }: { message: string }) {
  return (
    <LayeredPanel>
      <p className="text-text-muted text-sm">{message}</p>
      <div className="mt-4">
        <ButtonLink to="/members" variant="secondary">
          生徒管理へ戻る
        </ButtonLink>
      </div>
    </LayeredPanel>
  );
}
