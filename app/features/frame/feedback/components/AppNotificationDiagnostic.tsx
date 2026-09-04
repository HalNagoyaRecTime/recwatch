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
    <div id={id} className="mt-1 mr-8 ml-6">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
        <DiagnosticValue
          label="時刻"
          value={diagnostic.occurredAt ?? createdAt}
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
      <dt>{label}</dt>
      <dd className="break-all select-text">{value}</dd>
    </>
  ) : null;
}
