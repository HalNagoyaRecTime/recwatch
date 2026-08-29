import { ArrowDown, ArrowUp, Reply } from "lucide-react";

export function SearchFooter() {
  return (
    <footer className="app-rounded border-border-subtle bg-surface-base text-text-subtle flex h-11 shrink-0 items-center gap-4 border px-4 py-2 text-[11px]">
      <div className="flex h-full items-center gap-1">
        <kbd className="app-rounded border-border-subtle bg-bg-gradient-start flex aspect-square h-full shrink-0 items-center justify-center border p-1">
          <ArrowUp className="h-full w-full" />
        </kbd>
        <kbd className="app-rounded border-border-subtle bg-bg-gradient-start flex aspect-square h-full shrink-0 items-center justify-center border p-1">
          <ArrowDown className="h-full w-full" />
        </kbd>
        <span className="text-xs">で選択</span>
      </div>
      <div className="flex h-full items-center gap-1">
        <kbd className="app-rounded border-border-subtle bg-bg-gradient-start flex aspect-square h-full shrink-0 items-center justify-center border p-1">
          <Reply className="h-full w-full -scale-x-100 rotate-180" />
        </kbd>
        <span className="text-xs">で選択</span>
      </div>
    </footer>
  );
}
