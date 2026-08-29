import { PageHeader } from "~/components/ui/layout/PageHeader";
import { DashboardNavigationGrid } from "~/features/dashboard/components/DashboardNavigationGrid";

export function DashboardPage({
  connectionError,
}: {
  connectionError?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-[1320px] flex-col">
      <PageHeader title="ダッシュボード" />

      {connectionError ? (
        <p
          role="alert"
          className="app-rounded border-tone-danger-border bg-tone-danger-bg text-tone-danger-text border px-4 py-3 text-sm"
        >
          API接続状況: {connectionError}
        </p>
      ) : null}

      <div className="flex flex-1 items-start py-8 md:items-center">
        <DashboardNavigationGrid />
      </div>
    </div>
  );
}
