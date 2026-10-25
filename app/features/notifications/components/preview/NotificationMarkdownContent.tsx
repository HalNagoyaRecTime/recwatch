import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";
import { toNotificationMarkdown } from "~/features/notifications/model/notification-markdown";

/** 送信後と同じMarkdownで、入力中の本文をプレビューする。 */
export function NotificationMarkdownContent({ content }: { content: string }) {
  return <MarkdownContent content={toNotificationMarkdown(content)} />;
}
