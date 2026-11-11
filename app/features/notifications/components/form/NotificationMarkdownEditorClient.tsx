import { cloneElement, useEffect, useRef, useState } from "react";
import MDEditor, { commands, type ICommand } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { NotificationMarkdownContent } from "~/features/notifications/components/preview/NotificationMarkdownContent";
import styles from "./NotificationMarkdownEditor.module.css";

const MIN_CONTENT_HEIGHT = 96;
const TOOLBAR_HEIGHT = 40;
const MIN_EDITOR_HEIGHT = MIN_CONTENT_HEIGHT + TOOLBAR_HEIGHT;
const MAX_EDITOR_HEIGHT = 320;

const commandLabels: Record<string, string> = {
  bold: "太字（Ctrl+B）",
  italic: "斜体（Ctrl+I）",
  strikethrough: "取り消し線（Ctrl+Shift+X）",
  hr: "区切り線を挿入（Ctrl+H）",
  title: "見出しを挿入",
  heading1: "見出し1（Ctrl+1）",
  heading2: "見出し2（Ctrl+2）",
  heading3: "見出し3（Ctrl+3）",
  heading4: "見出し4（Ctrl+4）",
  heading5: "見出し5（Ctrl+5）",
  heading6: "見出し6（Ctrl+6）",
  link: "リンクを挿入（Ctrl+L）",
  quote: "引用を挿入（Ctrl+Q）",
  code: "コードを挿入（Ctrl+J）",
  codeBlock: "コードブロックを挿入（Ctrl+Shift+J）",
  comment: "コメントを挿入（Ctrl+/）",
  image: "画像を挿入（Ctrl+K）",
  table: "表を挿入",
  "unordered-list": "箇条書き（Ctrl+Shift+U）",
  "ordered-list": "番号付きリスト（Ctrl+Shift+O）",
  "checked-list": "チェックリスト（Ctrl+Shift+C）",
  help: "使い方を開く",
  edit: "本文を編集（Ctrl+7）",
  preview: "表示を確認（Ctrl+9）",
};

function translateCommand(command: ICommand): ICommand {
  const label = commandLabels[command.name ?? ""];
  const buttonProps = label
    ? { ...command.buttonProps, "aria-label": label, title: label }
    : command.buttonProps;
  const icon =
    command.name?.startsWith("heading") && command.icon && label
      ? cloneElement(command.icon, undefined, `見出し${command.name.slice(-1)}`)
      : command.icon;
  if (Array.isArray(command.children)) {
    return {
      ...command,
      buttonProps,
      icon,
      children: command.children.map(translateCommand),
    };
  }
  return { ...command, buttonProps, icon };
}

const translatedCommands = commands.getCommands().map(translateCommand);
const translatedPreviewCommands = [commands.codeEdit, commands.codePreview].map(
  translateCommand
);

export default function NotificationMarkdownEditorClient({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(MIN_EDITOR_HEIGHT);
  const colorMode = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updateHeight = () => {
      const textarea = editor.querySelector("textarea");
      if (!textarea) return;

      const previousHeight = textarea.style.height;
      textarea.style.height = "0px";
      const contentHeight = textarea.scrollHeight;
      textarea.style.height = previousHeight;

      const nextHeight = Math.min(
        MAX_EDITOR_HEIGHT,
        Math.max(MIN_EDITOR_HEIGHT, contentHeight + TOOLBAR_HEIGHT)
      );
      setEditorHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight
      );
    };

    updateHeight();
    if (typeof ResizeObserver === "undefined") return;
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(editor);
    return () => resizeObserver.disconnect();
  }, [value]);

  return (
    <div ref={editorRef}>
      <MDEditor
        value={value}
        onChange={(markdown) => onChange(markdown ?? "")}
        preview="edit"
        commands={translatedCommands}
        extraCommands={translatedPreviewCommands}
        components={{
          preview: (source) => <NotificationMarkdownContent content={source} />,
        }}
        textareaProps={{
          "aria-label": "詳細本文の編集",
          maxLength: 2000,
          placeholder: "詳細本文を入力してください",
        }}
        height={editorHeight}
        minHeight={MIN_EDITOR_HEIGHT}
        maxHeight={MAX_EDITOR_HEIGHT}
        visibleDragbar={false}
        data-color-mode={colorMode}
        className={styles.editor}
      />
    </div>
  );
}
