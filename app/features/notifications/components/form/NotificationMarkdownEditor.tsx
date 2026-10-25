import { lazy, Suspense } from "react";

const BrowserMarkdownEditor = lazy(
  () =>
    import("~/features/notifications/components/form/NotificationMarkdownEditorClient")
);

export function NotificationMarkdownEditor({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-text-base mb-2 block text-sm font-medium">
        詳細本文 <span className="text-tone-danger-text">*</span>
      </label>
      <div
        aria-invalid={Boolean(error)}
        className="border-border-base bg-surface-base overflow-hidden rounded-md border"
      >
        <Suspense
          fallback={
            <div
              aria-label="Markdownエディターを読み込み中"
              className="bg-surface-muted min-h-64 animate-pulse"
            />
          }
        >
          <BrowserMarkdownEditor value={value} onChange={onChange} />
        </Suspense>
      </div>
      <div className="text-text-subtle mt-2 flex justify-between gap-3 text-xs">
        <p>Enterで改行、空行で段落を分けます。</p>
        <span className="shrink-0">{value.length} / 2000</span>
      </div>
      {error ? (
        <p className="text-tone-danger-text mt-1 text-xs">{error}</p>
      ) : null}
    </div>
  );
}
