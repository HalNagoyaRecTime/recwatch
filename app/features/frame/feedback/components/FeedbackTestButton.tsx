import { useFeedback } from "../hooks/useFeedback";

/** 開発環境でFeedbackの表示経路を確認するためのテストボタンです。 */
export function FeedbackTestButton() {
  const { report } = useFeedback();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <button
      type="button"
      className="border-border-base bg-surface-base text-text-muted hover:bg-surface-hover rounded-md border px-2 py-1 text-xs"
      onClick={() =>
        report({
          kind: "action-error",
          title: "テスト通知",
          message: "Feedback表示の動作確認用です",
          diagnostic: {
            route: window.location.pathname,
            action: "feedback-test",
          },
        })
      }
    >
      通知テスト
    </button>
  );
}
