import {
  Check,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Upload,
  Users,
} from "lucide-react";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { FormModal } from "~/components/ui/modal/FormModal";
import type { GatheringImportGateway } from "~/features/gathering-import/api/contracts/gathering-import-gateway";
import { httpGatheringImportGateway } from "~/features/gathering-import/api/http/http-gathering-import-gateway";
import type { GatheringImportResult } from "~/features/gathering-import/model/gathering-import-result";
import type { EventDetailOutletContext } from "~/features/events/pages/EventDetailPage";
import { ApiClientError } from "~/lib/api-client-error";
import { getErrorMessage } from "~/lib/client-error";

type GatheringImportPageProps = {
  gateway?: GatheringImportGateway;
};

type Preview = { file: File; result: GatheringImportResult };

export function GatheringImportPage({
  gateway = httpGatheringImportGateway,
}: GatheringImportPageProps) {
  const { eventId: eventIdParam } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext<
    EventDetailOutletContext | undefined
  >();
  const eventId = Number(eventIdParam);
  const closePath = `/events/${eventId}`;
  const handleClose = useCallback(
    () => navigate(closePath),
    [closePath, navigate]
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [committed, setCommitted] = useState<GatheringImportResult | null>(
    null
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcknowledgedExclusion, setHasAcknowledgedExclusion] =
    useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsBusy(true);
    setError(null);
    setHasAcknowledgedExclusion(false);
    try {
      setPreview({ file, result: await gateway.preview(eventId, file) });
    } catch (err) {
      setPreview(null);
      setError(getErrorMessage(err, "ファイルを読み取れませんでした。"));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCommit() {
    if (!preview) return;
    setIsBusy(true);
    setError(null);
    try {
      setCommitted(
        await gateway.commit(eventId, preview.file, preview.result.lockVersion)
      );
      outletContext?.reload();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setPreview(null);
        setError("確認している間に、この競技の集合が変更されました。");
      } else {
        setError(getErrorMessage(err, "集合の取り込みに失敗しました。"));
      }
    } finally {
      setIsBusy(false);
    }
  }

  const fileButton = (label: string) => (
    <>
      <Button
        disabled={isBusy}
        icon={isBusy ? Loader2 : Upload}
        onClick={() => inputRef.current?.click()}
        variant={preview ? "secondary" : "primary"}
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        accept=".csv"
        aria-label="CSV ファイル"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
        type="file"
      />
    </>
  );

  return (
    <FormModal
      description="CSV の内容で、この競技の集合をすべて置き換えます。"
      isDismissDisabled={isBusy}
      onClose={handleClose}
      size="xl"
      title={
        outletContext?.event
          ? `集合を取り込む（${outletContext.event.name}）`
          : "集合を取り込む"
      }
    >
      {(requestClose) =>
        committed ? (
          <div className="space-y-4">
            <p className="text-tone-success-text text-base" role="status">
              {committed.importedRows.toLocaleString()}
              人を集合に取り込みました。
              {committed.excludedRows > 0
                ? `${committed.excludedRows.toLocaleString()}行は取り込んでいません。`
                : null}
            </p>
            <div className="flex justify-end">
              <Button onClick={requestClose} variant="primary">
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {error ? (
              <p className="text-tone-danger-text text-sm" role="alert">
                {error}
              </p>
            ) : null}
            {preview ? (
              <PreviewStep
                hasAcknowledgedExclusion={hasAcknowledgedExclusion}
                isBusy={isBusy}
                onAcknowledgeExclusion={setHasAcknowledgedExclusion}
                onCancel={requestClose}
                onCommit={() => void handleCommit()}
                reselectButton={fileButton("別のファイルを選ぶ")}
                result={preview.result}
              />
            ) : (
              <SelectStep fileButton={fileButton("CSV ファイルを選ぶ")} />
            )}
          </div>
        )
      }
    </FormModal>
  );
}

function SelectStep({ fileButton }: { fileButton: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="text-text-base space-y-2 text-sm">
        <p>
          1行目に次の列がある
          CSV（UTF-8）を選んでください。ほかの列は無視します。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>ラウンド：1〜99</li>
          <li>開始時刻：10:00 の形。同じラウンドの行は同じ時刻にする</li>
          <li>集合時刻：9:45 の形</li>
          <li>集合場所：登録済みの集合場所の名前</li>
          <li>生徒：競技出場者リストの「氏名（自動表示）」をそのまま貼る</li>
        </ul>
        <p className="text-text-muted">
          ラウンド・集合時刻・集合場所が同じ行が、1つの集合になります。確定する前に、取り込む内容を確認できます。
        </p>
      </div>
      <div className="flex justify-end">{fileButton}</div>
    </div>
  );
}

type PreviewTab = "gatherings" | "errors" | "warnings";

function PreviewStep({
  hasAcknowledgedExclusion,
  isBusy,
  onAcknowledgeExclusion,
  onCancel,
  onCommit,
  reselectButton,
  result,
}: {
  hasAcknowledgedExclusion: boolean;
  isBusy: boolean;
  onAcknowledgeExclusion: (value: boolean) => void;
  onCancel: () => void;
  onCommit: () => void;
  reselectButton: ReactNode;
  result: GatheringImportResult;
}) {
  const [selectedTab, setSelectedTab] = useState<PreviewTab>("gatherings");
  const tabId = useId();
  const gatheringCount = result.rounds.reduce(
    (count, round) => count + round.gatherings.length,
    0
  );
  const hasExcluded = result.excludedRows > 0;
  const canCommit =
    result.importedRows > 0 && (!hasExcluded || hasAcknowledgedExclusion);
  const allTabs: {
    value: PreviewTab;
    label: string;
    count: number;
    tone: Tone;
  }[] = [
    {
      value: "gatherings",
      label: "集合",
      count: gatheringCount,
      tone: "neutral",
    },
    {
      value: "errors",
      label: "エラー",
      count: result.excludedRows,
      tone: "danger",
    },
    {
      value: "warnings",
      label: "警告",
      count: result.warnings.length,
      tone: "warning",
    },
  ];
  const tabs = allTabs.filter(
    (item) => item.value === "gatherings" || item.count > 0
  );
  // 別のファイルを選び直すと、選んでいたタブが無くなることがある。
  const tab = tabs.some((item) => item.value === selectedTab)
    ? selectedTab
    : "gatherings";

  return (
    <div className="space-y-4">
      <div
        aria-label="取り込み結果"
        className="border-border-subtle flex gap-1 border-b"
        role="tablist"
      >
        {tabs.map((item) => (
          <button
            key={item.value}
            aria-controls={`${tabId}-panel`}
            aria-selected={tab === item.value}
            id={`${tabId}-${item.value}`}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
              tab === item.value
                ? "border-brand-primary text-text-base"
                : "text-text-muted hover:text-text-base border-transparent"
            }`}
            onClick={() => setSelectedTab(item.value)}
            role="tab"
            type="button"
          >
            {item.label}
            <span
              className={`app-rounded px-1.5 py-0.5 text-xs font-semibold ${TONE[item.tone].badge}`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`${tabId}-${tab}`}
        className="h-80 overflow-y-auto"
        id={`${tabId}-panel`}
        role="tabpanel"
      >
        {tab === "gatherings" ? (
          <RoundList rounds={result.rounds} />
        ) : tab === "errors" ? (
          <IssueList
            rows={result.errors.map((error) => ({
              rowNumber: error.rowNumber,
              student: error.student,
              detail: (
                <span
                  className={`app-rounded px-2 py-0.5 text-xs font-medium ${TONE.danger.badge}`}
                  title={error.message}
                >
                  {ERROR_REASON[error.code] ?? error.message}
                </span>
              ),
            }))}
          />
        ) : (
          <IssueList
            rows={result.warnings.map((warning) => ({
              rowNumber: warning.rowNumber,
              student: warning.student,
              detail: (
                <span className="text-text-muted text-sm">
                  登録は
                  <span className="text-text-base ml-1 font-medium">
                    {warning.registeredName}
                  </span>
                </span>
              ),
            }))}
          />
        )}
      </div>

      <p className="text-text-muted text-sm">
        CSV に無い今の集合は、自動通知ごと消えます。
      </p>

      <div className="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        {hasExcluded ? (
          <label className="text-tone-danger-text flex items-center gap-2 text-sm font-medium">
            <input
              checked={hasAcknowledgedExclusion}
              onChange={(event) => onAcknowledgeExclusion(event.target.checked)}
              type="checkbox"
            />
            {result.excludedRows.toLocaleString()}
            行を除いて取り込む
          </label>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={isBusy} onClick={onCancel}>
            キャンセル
          </Button>
          {reselectButton}
          <Button
            disabled={!canCommit || isBusy}
            icon={Check}
            onClick={onCommit}
            variant="primary"
          >
            {isBusy ? "取り込み中..." : `確定する（${result.importedRows}人）`}
          </Button>
        </div>
      </div>
    </div>
  );
}

type Tone = "neutral" | "danger" | "warning";

const TONE: Record<Tone, { badge: string }> = {
  neutral: { badge: "bg-surface-muted text-text-muted" },
  danger: { badge: "bg-tone-danger-bg text-tone-danger-text" },
  warning: { badge: "bg-tone-warning-bg text-tone-warning-text" },
};

function RoundList({ rounds }: { rounds: GatheringImportResult["rounds"] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {rounds.map((round) => (
        <section
          key={round.round}
          aria-label={`ラウンド ${round.round}`}
          className="bg-surface-muted app-rounded space-y-2 self-start p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-text-base text-sm font-semibold">
              ラウンド {round.round}
              {round.startTime ? (
                <span className="ml-3 text-sm font-normal">
                  開始 {round.startTime}
                </span>
              ) : null}
            </h3>
            <span className="app-rounded bg-surface-base text-text-muted px-2 py-1 text-xs font-medium whitespace-nowrap">
              合計{" "}
              {round.gatherings.reduce(
                (count, gathering) => count + gathering.members.length,
                0
              )}
              名
            </span>
          </div>
          <ul className="space-y-2">
            {round.gatherings.map((gathering) => (
              <li
                key={`${gathering.time}-${gathering.spotName}`}
                className="border-border-subtle bg-surface-base app-rounded border text-sm"
              >
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-1 px-3 py-2 [&::-webkit-details-marker]:hidden">
                    <span className="text-text-base inline-flex items-center gap-1.5">
                      <Clock
                        aria-hidden="true"
                        className="text-text-muted size-4"
                      />
                      {gathering.time}
                    </span>
                    <span className="text-text-base inline-flex items-center gap-1.5">
                      <MapPin
                        aria-hidden="true"
                        className="text-text-muted size-4"
                      />
                      {gathering.spotName}
                    </span>
                    <span className="text-text-base inline-flex items-center gap-1.5">
                      <Users
                        aria-hidden="true"
                        className="text-text-muted size-4"
                      />
                      {gathering.members.length}名
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="text-text-muted ml-auto size-4 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <ul className="border-border-subtle flex flex-wrap gap-1.5 border-t px-3 py-2">
                    {gathering.members.map((member) => (
                      <li
                        key={member.userId}
                        className="bg-surface-muted app-rounded text-text-muted px-2 py-0.5 text-xs"
                      >
                        {member.name}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const ERROR_REASON: Record<string, string> = {
  INVALID_ROUND: "ラウンドが 1〜99 でない",
  INVALID_START_TIME: "開始時刻の形が違う",
  INVALID_GATHERING_TIME: "集合時刻の形が違う",
  GATHERING_SPOT_NOT_FOUND: "集合場所が未登録",
  GATHERING_SPOT_AMBIGUOUS: "同じ名前の集合場所がある",
  INVALID_STUDENT: "番号を読めない",
  STUDENT_NOT_FOUND: "生徒が未登録",
  DUPLICATE_STUDENT: "生徒が重複",
  ROUND_START_TIME_MISMATCH: "開始時刻がラウンド内で不揃い",
};

function IssueList({
  rows,
}: {
  rows: { rowNumber: number; student: string; detail: ReactNode }[];
}) {
  return (
    <ul className="divide-border-subtle divide-y">
      {rows.map((row, index) => {
        const [number, ...names] = row.student.split(/\s+/);
        const name = names.join(" ");
        return (
          <li
            key={`${row.rowNumber}-${index}`}
            className="grid grid-cols-[3.5rem_12rem_1fr] items-center gap-4 py-2"
          >
            <span className="text-text-subtle text-xs">
              {row.rowNumber}行目
            </span>
            <span className="min-w-0">
              <span className="text-text-base block truncate text-sm">
                {name || number || "（空欄）"}
              </span>
              {name ? (
                <span className="text-text-subtle block text-xs">{number}</span>
              ) : null}
            </span>
            <span className="justify-self-start">{row.detail}</span>
          </li>
        );
      })}
    </ul>
  );
}
