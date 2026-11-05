import { useEffect, useRef, useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { NotificationMarkdownContent } from "~/features/notifications/components/preview/NotificationMarkdownContent";
import styles from "./NotificationMarkdownEditor.module.css";

const MIN_CONTENT_HEIGHT = 96;
const TOOLBAR_HEIGHT = 40;
const MIN_EDITOR_HEIGHT = MIN_CONTENT_HEIGHT + TOOLBAR_HEIGHT;
const MAX_EDITOR_HEIGHT = 320;

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
        extraCommands={[commands.codeEdit, commands.codePreview]}
        components={{
          preview: (source) => <NotificationMarkdownContent content={source} />,
        }}
        textareaProps={{
          "aria-label": "Markdownソース",
          maxLength: 2000,
          placeholder: "Markdownを入力してください",
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
