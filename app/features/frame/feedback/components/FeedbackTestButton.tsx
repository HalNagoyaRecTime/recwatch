import { useFeedback } from "../hooks/useFeedback";
import { useState } from "react";

/** 開発環境でFeedbackの表示経路を確認するためのテストボタンです。 */
export function FeedbackTestButton() {
  const { report } = useFeedback();
  const [variantIndex, setVariantIndex] = useState(0);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <button
      type="button"
      className="border-border-base bg-surface-base text-text-muted hover:bg-surface-hover rounded-md border px-2 py-1 text-xs"
      onClick={() => {
        const variant = [
          {
            kind: "action-error" as const,
            title: "テスト通知",
            message: "Feedback表示の動作確認用です。詳細を展開できます。",
            diagnostic: {
              route: window.location.pathname,
              action: "feedback-test-error",
              status: 500,
              errorCode: "TEST_ERROR",
              requestId: "test-request-abcdefghijklmnopqrstuvwxyz0123456789",
              endpoint: "/api/feedback-test",
            },
          },
          {
            kind: "system-warning" as const,
            title: "テスト通知（警告）",
            message: "バックグラウンド処理の警告を確認しています。",
          },
          {
            kind: "background-success" as const,
            title: "テスト通知（完了）",
            message: "バックグラウンド処理が完了しました。",
          },
          {
            kind: "action-success" as const,
            title: "テスト通知（成功）",
            message: "操作が正常に完了しました。",
          },
        ][variantIndex];
        report(variant);
        setVariantIndex((index) => (index + 1) % 4);
      }}
    >
      通知テスト
    </button>
  );
}
