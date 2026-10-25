import type { Nodes } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const parser = unified().use(remarkParse).use(remarkGfm).freeze();

type Change = { start: number; end: number; value: string };

/** 通常の文章の改行だけを強制改行にし、他のMarkdown構文は書き換えない。 */
export function toNotificationMarkdown(source: string): string {
  return rewriteLineBreaks(source, "send");
}

/** 保存済みの改行用スペースを、編集時は通常のEnterとして扱う。 */
export function toNotificationMarkdownInput(source: string): string {
  return rewriteLineBreaks(source, "edit");
}

function rewriteLineBreaks(source: string, mode: "send" | "edit"): string {
  const changes: Change[] = [];

  function visit(node: Nodes) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start !== undefined && end !== undefined) {
      const original = source.slice(start, end);
      if (mode === "send" && node.type === "text") {
        for (const match of original.matchAll(/\r?\n/g)) {
          changes.push({
            start: start + match.index,
            end: start + match.index,
            value: "  ",
          });
        }
      } else if (mode === "edit" && node.type === "break") {
        const spaces = /^ {2,}(?=\r?\n$)/.exec(original);
        if (spaces)
          changes.push({ start, end: start + spaces[0].length, value: "" });
      }
    }
    if ("children" in node) node.children.forEach(visit);
  }

  visit(parser.parse(source));
  let result = source;
  for (const change of changes.sort((a, b) => b.start - a.start)) {
    result =
      result.slice(0, change.start) + change.value + result.slice(change.end);
  }
  return result;
}
