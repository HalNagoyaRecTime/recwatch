export function DashboardPage({
  connectionError,
  userName,
}: {
  connectionError?: string;
  userName?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-[1320px] flex-col">
      {connectionError ? (
        <p
          role="alert"
          className="app-rounded border-tone-danger-border bg-tone-danger-bg text-tone-danger-text border px-4 py-3 text-sm"
        >
          API接続状況: {connectionError}
        </p>
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
        <p className="text-text-base text-4xl font-bold tracking-wider">
          ようこそ
        </p>
        <p className="text-text-base text-4xl font-bold tracking-wider">
          {userName ?? "ユーザー"}さん
        </p>
      </div>
    </div>
  );
}
