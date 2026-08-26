import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";

import { MobileDeviceFrame } from "~/components/ui/layout/MobileDeviceFrame";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

type NotificationMobilePreviewProps = {
  draft: NotificationDraft;
  mode: NotificationPreviewMode;
};

export type NotificationPreviewMode = "lock-screen" | "notification-detail";

export function NotificationMobilePreview({
  draft,
  mode,
}: NotificationMobilePreviewProps) {
  const currentDate = useCurrentDate();

  return (
    <div
      className="aspect-9/20 h-auto max-w-full min-w-0 shrink-0"
      style={{
        width:
          "min(calc(100cqw - 2rem), 20rem, calc((100cqh - 2.25rem) * 0.45))",
      }}
    >
      <MobileDeviceFrame
        homeIndicatorClassName="bg-white/90"
        statusBarClassName="text-white"
        statusBarTime={formatCurrentTime(currentDate)}
      >
        {mode === "lock-screen" ? (
          <LockScreenPreview currentDate={currentDate} draft={draft} />
        ) : (
          <NotificationDetailPreview currentDate={currentDate} draft={draft} />
        )}
      </MobileDeviceFrame>
    </div>
  );
}

function LockScreenPreview({
  currentDate,
  draft,
}: {
  currentDate: Date;
  draft: NotificationDraft;
}) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#6687bf,#91b3df_55%,#d5e4f5)] dark:brightness-75" />
      <div className="text-text-base relative z-10 h-full">
        <div className="pt-[22cqw] text-center">
          <p className="text-[19cqw] leading-none font-light tracking-tight">
            {formatCurrentTime(currentDate)}
          </p>
          <p className="my-[2cqw] text-[4.5cqw]">
            {formatCurrentDate(currentDate)}
          </p>
        </div>

        <NotificationCard draft={draft} />

        <p className="text-text-base/90 absolute inset-x-0 bottom-[5cqw] text-center text-[3.5cqw]">
          上にスワイプして開く
        </p>
      </div>
    </div>
  );
}

function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  return currentDate;
}

function formatCurrentTime(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    hour12: false,
    minute: "2-digit",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "0";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour.replace(/^0(?=\d)/, "")}:${minute}`;
}

function formatCurrentDate(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    day: "numeric",
    month: "numeric",
    weekday: "long",
  }).formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";

  return `${month}月${day}日 ${weekday}`;
}

function formatCurrentDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}/${values.month}/${values.day} ${values.hour}:${values.minute}`;
}

function NotificationDetailPreview({
  currentDate,
  draft,
}: {
  currentDate: Date;
  draft: NotificationDraft;
}) {
  return (
    <div
      aria-label="通知詳細プレビュー"
      className="bg-surface-base text-text-base relative h-full overflow-hidden"
      role="region"
    >
      <div aria-hidden="true" className="h-[14cqw]" />
      <header className="border-border-base bg-surface-base relative border-b px-[4cqw] py-[3cqw] shadow-sm">
        <ArrowLeft
          aria-hidden="true"
          className="text-text-muted absolute top-1/2 left-[4cqw] size-[5cqw] -translate-y-1/2"
        />
        <h2 className="text-center text-[4cqw] font-semibold">通知詳細</h2>
      </header>

      <main className="bg-surface-base px-[5cqw] py-[5cqw]">
        <h3 className="text-text-base text-[4.5cqw] font-semibold wrap-break-word">
          {draft.title || "タイトル"}
        </h3>
        <time className="text-text-subtle mt-[2cqw] block text-[3.25cqw]">
          {formatCurrentDateTime(getNotificationDetailDate(draft, currentDate))}
        </time>
        <div className="border-border-base mt-[6cqw] border-t" />
        <div className="mt-[5cqw]">
          <ReactMarkdown components={markdownComponents}>
            {draft.markdownDescription?.trim() || "しょうさいですよ"}
          </ReactMarkdown>
        </div>
        <div className="border-border-base mt-[6cqw] border-t" />
      </main>
    </div>
  );
}

function getNotificationDetailDate(
  draft: NotificationDraft,
  currentDate: Date
) {
  if (draft.deliveryTiming !== "scheduled" || !draft.scheduledAt) {
    return currentDate;
  }

  const scheduledDate = new Date(draft.scheduledAt);
  return Number.isNaN(scheduledDate.getTime()) ? currentDate : scheduledDate;
}

function NotificationCard({ draft }: { draft: NotificationDraft }) {
  const pushTitle = draft.pushTitle ?? draft.title;
  const pushBody = draft.pushBody ?? draft.body;

  return (
    <div className="bg-surface-base text-text-base mx-[4cqw] rounded-[5.5cqw] p-[3.5cqw] shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-[3cqw]">
        <span className="bg-surface-muted relative flex size-[9cqw] shrink-0 items-center justify-center rounded-[2.5cqw] shadow-sm">
          <img
            alt="recwatch"
            className="aspect-square h-[7cqw] w-auto"
            src="/recwatch-logo.svg"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-[5cqw]">
            <p className="min-w-0 flex-1 truncate text-[4cqw] font-semibold">
              {pushTitle || "タイトル"}
            </p>
            <span className="text-text-subtle shrink-0 text-[2.5cqw]">
              たった今
            </span>
          </div>
          <p className="text-text-muted mt-[0.5cqw] line-clamp-4 pr-[2cqw] text-[3.6cqw] leading-relaxed wrap-break-word whitespace-pre-wrap">
            {pushBody || "本文"}
          </p>
        </div>
      </div>
    </div>
  );
}

const markdownComponents: Components = {
  a: ({ children, href }) => (
    <a className="text-brand-primary underline underline-offset-2" href={href}>
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-border-base text-text-muted my-[2cqw] border-l-2 pl-[3cqw]">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-surface-muted rounded px-[1cqw] py-[0.5cqw]">
      {children}
    </code>
  ),
  h1: ({ children }) => (
    <h4 className="text-text-base mt-[2cqw] text-[4cqw] font-semibold">
      {children}
    </h4>
  ),
  h2: ({ children }) => (
    <h4 className="text-text-base mt-[2cqw] text-[3.75cqw] font-semibold">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h4 className="text-text-base mt-[2cqw] text-[3.5cqw] font-semibold">
      {children}
    </h4>
  ),
  li: ({ children }) => <li className="ml-[4cqw]">{children}</li>,
  ol: ({ children }) => (
    <ol className="text-text-muted my-[2cqw] list-decimal space-y-[1cqw] text-[3.25cqw] leading-relaxed">
      {children}
    </ol>
  ),
  p: ({ children }) => (
    <p className="text-text-muted mt-[2cqw] text-[3.5cqw] leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="text-text-base font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="text-text-muted my-[2cqw] list-disc space-y-[1cqw] text-[3.25cqw] leading-relaxed">
      {children}
    </ul>
  ),
};
