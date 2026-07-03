import { useState } from "react";
import { cn } from "~/lib/cn";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  CopyIcon,
  XIcon,
} from "lucide-react";
import {
  actionListContainerStyle,
  actionListItemStyle,
} from "~/components/ui/styles/action-list-styles";

// --- ダミーデータ（テスト用） ---
type Notice = {
  id: string;
  type: "success" | "error";
  message: string;
  detail?: string;
  time: string;
};

const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    type: "error",
    message: "システムエラーが発生しました",
    detail:
      "Error: Request failed with status code 500\n  at fetchUser (api.js:42)\n  at Query.queryFn (query.js:10)",
    time: "14:02",
  },
  {
    id: "2",
    type: "success",
    message: "イベント設定を保存しました",
    time: "13:58",
  },
  {
    id: "3",
    type: "success",
    message: "メンバーのCSVインポートが完了しました",
    time: "11:20",
  },
];

type NoticeMenuPanelProps = {
  onClose: () => void;
};

export function NoticeMenuPanel({ onClose }: NoticeMenuPanelProps) {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("コピーしました");
  };

  return (
    <div className={cn(actionListContainerStyle, "flex w-80 flex-col p-1.5")}>
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-2">
        <h3 className="text-text-1 text-sm font-semibold">
          通知・システムログ
        </h3>
        <button
          onClick={onClose}
          className="text-text-2 hover:text-text-1 cursor-pointer rounded transition-colors"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="bg-border-1 mx-1 mb-1.5 h-px shrink-0" />

      {/* Body */}
      <div className="max-h-96 overflow-y-auto px-1">
        {notices.length === 0 ? (
          <p className="text-text-3 p-4 text-center text-sm">
            通知はありません
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-2.5 transition-colors",
                  notice.type === "error"
                    ? "border-tone-danger-border bg-tone-danger-bg hover:bg-tone-danger-bg-hover"
                    : "border-border-2 bg-surface-1 hover:bg-surface-2"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {notice.type === "error" ? (
                      <AlertCircleIcon
                        className="text-tone-danger-text mt-0.5 shrink-0"
                        size={16}
                      />
                    ) : (
                      <CheckCircle2Icon
                        className="text-tone-green-text mt-0.5 shrink-0"
                        size={16}
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        notice.type === "error"
                          ? "text-tone-danger-text"
                          : "text-text-1"
                      )}
                    >
                      {notice.message}
                    </span>
                  </div>
                  <span className="text-text-3 shrink-0 text-xs">
                    {notice.time}
                  </span>
                </div>

                {notice.detail && (
                  <div className="group border-tone-danger-border bg-surface-overlay text-tone-danger-text relative mt-1 overflow-hidden rounded border p-2 text-xs shadow-sm">
                    <pre className="font-mono leading-relaxed whitespace-pre-wrap">
                      {notice.detail}
                    </pre>
                    <button
                      onClick={() => handleCopy(notice.detail!)}
                      className="border-tone-danger-border bg-surface-1 hover:bg-tone-danger-bg-hover absolute top-1 right-1 hidden cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs shadow-sm transition-colors group-hover:flex"
                      title="エラー詳細をコピー"
                    >
                      <CopyIcon size={12} />
                      コピー
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-border-1 mx-1 mt-1.5 h-px shrink-0" />
      <div className="px-1 pt-1.5">
        <button
          onClick={() => setNotices([])}
          className={cn(
            actionListItemStyle({ intent: "primary" }),
            "text-text-2 hover:text-text-1 justify-center font-medium"
          )}
        >
          すべてクリア
        </button>
      </div>
    </div>
  );
}
