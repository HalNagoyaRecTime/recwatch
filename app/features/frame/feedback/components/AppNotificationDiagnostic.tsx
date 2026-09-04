import type { AppNotification } from "../model/app-notification";

type AppNotificationDiagnosticProps = {
  id: string;
  diagnostic: NonNullable<AppNotification["diagnostic"]>;
  createdAt: string;
};

export function AppNotificationDiagnostic({
  id,
  diagnostic,
  createdAt,
}: AppNotificationDiagnosticProps) {
  return (
    <div id={id} className="text-text-muted mt-1 mr-8 ml-6 text-xs leading-5">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
        <DiagnosticValue
          label="時刻"
          value={formatAppNotificationDateTime(
            diagnostic.occurredAt ?? createdAt
          )}
        />
        <DiagnosticValue label="画面" value={diagnostic.route} />
        <DiagnosticValue label="操作" value={diagnostic.action} />
        <DiagnosticValue
          label="HTTP Status"
          value={diagnostic.status?.toString()}
        />
        <DiagnosticValue label="Error Code" value={diagnostic.errorCode} />
        <DiagnosticValue label="Request ID" value={diagnostic.requestId} />
        <DiagnosticValue label="Endpoint" value={diagnostic.endpoint} />
      </dl>
    </div>
  );
}

function DiagnosticValue({ label, value }: { label: string; value?: string }) {
  return value ? (
    <>
      <dt className="text-text-subtle">{label}</dt>
      <dd className="text-text-muted break-all select-text">{value}</dd>
    </>
  ) : null;
}

function formatAppNotificationDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
