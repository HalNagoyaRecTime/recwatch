import { useId, useState } from "react";
import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";

export function MarkdownPreview({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <div className="border-border-base app-rounded border p-3 text-sm">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
        className="text-text-base underline underline-offset-2"
      >
        本文のプレビュー
      </button>
      {expanded ? (
        <div id={id} className="mt-3">
          <MarkdownContent content={content} />
        </div>
      ) : null}
      <p className="text-text-muted mt-2 text-xs">
        改行は行末に空白2個、段落は空行で区切ります。
      </p>
    </div>
  );
}
