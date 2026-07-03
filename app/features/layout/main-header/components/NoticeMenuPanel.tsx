import { useState } from "react";
import { cn } from "~/lib/cn";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  CopyIcon,
  XIcon,
} from "lucide-react";

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
    <div className="w-80 overflow-hidden rounded-xl border border-(--border-2) bg-(--surface-1) shadow-xl">
      <div className="flex items-center justify-between border-b border-(--border-2) bg-(--surface-2) px-4 py-3">
        <h3 className="text-sm font-semibold text-(--text-1)">
          通知・システムログ
        </h3>
        <button
          onClick={onClose}
          className="cursor-pointer rounded text-(--text-2) transition-colors hover:text-(--text-1)"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto p-2">
        {notices.length === 0 ? (
          <p className="p-4 text-center text-sm text-(--text-3)">
            通知はありません
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border p-3",
                  notice.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-(--border-2) bg-(--surface-1)"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notice.type === "error" ? (
                      <AlertCircleIcon
                        className="mt-0.5 text-red-500"
                        size={16}
                      />
                    ) : (
                      <CheckCircle2Icon
                        className="mt-0.5 text-green-500"
                        size={16}
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        notice.type === "error"
                          ? "text-red-900"
                          : "text-(--text-1)"
                      )}
                    >
                      {notice.message}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-(--text-3)">
                    {notice.time}
                  </span>
                </div>

                {notice.detail && (
                  <div className="group relative mt-1 rounded border border-red-100 bg-white p-2 text-xs text-red-800 shadow-sm">
                    <pre className="font-mono leading-relaxed whitespace-pre-wrap">
                      {notice.detail}
                    </pre>
                    <button
                      onClick={() => handleCopy(notice.detail!)}
                      className="absolute top-1 right-1 hidden cursor-pointer items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs shadow-sm transition-colors group-hover:flex hover:bg-red-50"
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
      <div className="border-t border-(--border-2) bg-(--surface-2) p-2">
        <button
          onClick={() => setNotices([])}
          className="w-full cursor-pointer rounded py-1.5 text-xs font-medium text-(--text-2) transition-colors hover:bg-(--surface-3)"
        >
          すべてクリア
        </button>
      </div>
    </div>
  );
}
