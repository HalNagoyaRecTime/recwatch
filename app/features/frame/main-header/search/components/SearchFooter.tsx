import { ArrowDown, ArrowUp, CornerDownLeft } from "lucide-react";

export function SearchFooter() {
  return (
    <footer
      aria-label="キーボード操作"
      className="app-rounded border-border-subtle bg-surface-base text-text-subtle hidden h-9 shrink-0 items-center gap-4 border px-3 py-1.5 text-[11px] md:flex"
    >
      <div className="flex h-full items-center gap-1">
        <kbd className="app-rounded border-border-subtle bg-surface-base flex aspect-square h-full shrink-0 items-center justify-center border p-1">
          <ArrowUp aria-hidden="true" className="h-full w-full" />
        </kbd>
        <kbd className="app-rounded border-border-subtle bg-surface-base flex aspect-square h-full shrink-0 items-center justify-center border p-1">
          <ArrowDown aria-hidden="true" className="h-full w-full" />
        </kbd>
        <span>選択</span>
      </div>
      <div className="flex h-full items-center gap-1">
        <kbd className="app-rounded border-border-subtle bg-surface-base flex aspect-square h-full shrink-0 items-center justify-center border p-1">
          <CornerDownLeft aria-hidden="true" className="h-full w-full" />
        </kbd>
        <span>決定</span>
      </div>
      <div className="flex h-full items-center gap-1">
        <kbd className="app-rounded border-border-subtle bg-surface-base flex h-full items-center justify-center border px-1.5">
          Esc
        </kbd>
        <span>閉じる</span>
      </div>
    </footer>
  );
}
