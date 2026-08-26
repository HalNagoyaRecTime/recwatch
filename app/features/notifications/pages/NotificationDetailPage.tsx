import {
  Bot,
  CheckCircle2,
  Clock3,
  Search,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import { useState } from "react";
import { useParams } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { NotificationMobilePreview } from "~/features/notifications/components/preview/NotificationMobilePreview";
import {
  notificationDesignDetail,
  type NotificationDesignTargetGroup,
} from "~/features/notifications/model/notification-design-data";
import { initialNotificationDesignDraft } from "~/features/notifications/model/notification-draft";

const targetTypeLabels = {
  class: "クラス",
  gathering: "集合予定メンバー",
  person: "個人",
  team: "チーム",
} as const;

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h3 className="text-text-base mt-1 text-xl font-semibold">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-text-base mt-1 text-lg font-semibold">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-text-base mt-1 text-base font-semibold">{children}</h5>
  ),
  li: ({ children }) => <li className="ml-5">{children}</li>,
  ol: ({ children }) => (
    <ol className="text-text-muted my-3 list-decimal space-y-1">{children}</ol>
  ),
  p: ({ children }) => (
    <p className="text-text-muted mt-3 leading-7">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-text-base font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="text-text-muted my-3 list-disc space-y-1">{children}</ul>
  ),
};

export function NotificationDetailPage() {
  const { notificationId = "101" } = useParams();
  const detail = notificationDesignDetail;
  const previewDraft = {
    ...initialNotificationDesignDraft,
    deliveryTiming: "scheduled" as const,
    markdownDescription: detail.markdownDescription,
    pushBody: detail.pushBody,
    pushTitle: detail.pushTitle,
    scheduledAt: detail.scheduledAt,
    title: detail.title,
  };

  return (
    <PageLayout
      right={
        <NotificationMobilePreview
          draft={previewDraft}
          mode="notification-detail"
        />
      }
    >
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            actions={
              <ButtonLink to={`/notifications/${notificationId}/edit`}>
                通知を編集
              </ButtonLink>
            }
            description={`通知ID: ${notificationId}`}
            title="通知詳細"
          />

          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <LayeredPanel header={<PanelTitle>通知内容</PanelTitle>}>
                <div className="space-y-5">
                  <DetailField label="プッシュ通知タイトル">
                    {detail.pushTitle}
                  </DetailField>
                  <DetailField label="プッシュ通知本文">
                    {detail.pushBody}
                  </DetailField>
                  <DetailField label="通知詳細タイトル">
                    {detail.title}
                  </DetailField>
                  <DetailField label="通知詳細本文（Markdown）">
                    <div className="border-border-base bg-surface-muted rounded-lg border p-4">
                      <ReactMarkdown components={markdownComponents}>
                        {detail.markdownDescription}
                      </ReactMarkdown>
                    </div>
                  </DetailField>
                </div>
              </LayeredPanel>

              <LayeredPanel header={<PanelTitle>配信情報</PanelTitle>}>
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <InfoItem icon={statusIcon(detail.status)} label="状態">
                    <StatusBadge status={detail.status} />
                  </InfoItem>
                  <InfoItem icon={Bot} label="配信方法">
                    {detail.deliveryMode === "automatic" ? "自動" : "手動"}
                  </InfoItem>
                  <InfoItem icon={UserRound} label="作成者">
                    {detail.createdBy}
                  </InfoItem>
                  <InfoItem icon={Clock3} label="通知作成日時">
                    {formatDateTime(detail.createdAt)}
                  </InfoItem>
                  <InfoItem icon={Clock3} label="配信予定日時">
                    {formatDateTime(detail.scheduledAt)}
                  </InfoItem>
                  <InfoItem icon={UsersRound} label="予定人数">
                    {detail.plannedRecipientCount}人
                  </InfoItem>
                  <InfoItem icon={CheckCircle2} label="確定した人数">
                    {detail.confirmedRecipientCount == null
                      ? "未確定"
                      : `${detail.confirmedRecipientCount}人`}
                  </InfoItem>
                  <div className="border-border-base bg-surface-muted flex gap-3 rounded-lg border p-4 sm:col-span-2">
                    <DeliveryResult
                      count={detail.deliveredRecipientCount}
                      icon={CheckCircle2}
                      label="配信出来た人"
                      tone="success"
                    />
                    <div className="bg-border-base w-px shrink-0" />
                    <DeliveryResult
                      count={detail.failedRecipientCount}
                      icon={XCircle}
                      label="配信失敗した人"
                      tone="danger"
                    />
                  </div>
                </dl>
              </LayeredPanel>
            </div>

            <LayeredPanel header={<PanelTitle>通知対象</PanelTitle>}>
              <NotificationTargetList groups={detail.targetGroups} />
            </LayeredPanel>
          </div>
        </div>
      </PagePadding>
    </PageLayout>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-semibold">{children}</h2>;
}

function DetailField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-text-muted mb-1 text-sm">{label}</dt>
      <dd className="text-text-base wrap-break-word whitespace-pre-wrap">
        {children}
      </dd>
    </div>
  );
}

function InfoItem({
  children,
  icon: Icon,
  label,
}: {
  children: React.ReactNode;
  icon: typeof Clock3;
  label: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <Icon
        aria-hidden="true"
        className="text-text-muted mt-0.5 size-4 shrink-0"
      />
      <div className="min-w-0">
        <dt className="text-text-muted text-sm">{label}</dt>
        <dd className="text-text-base mt-1 font-medium wrap-break-word">
          {children}
        </dd>
      </div>
    </div>
  );
}

function DeliveryResult({
  count,
  icon: Icon,
  label,
  tone,
}: {
  count?: number;
  icon: typeof CheckCircle2;
  label: string;
  tone: "danger" | "success";
}) {
  const toneClassName = tone === "success" ? "text-success" : "text-danger";

  return (
    <div className="min-w-0 flex-1">
      <div className="text-text-muted flex items-center gap-2 text-sm">
        <Icon
          aria-hidden="true"
          className={["size-4", toneClassName].join(" ")}
        />
        <span>{label}</span>
      </div>
      <p className={["mt-1 text-xl font-semibold", toneClassName].join(" ")}>
        {count == null ? "未集計" : String(count) + "人"}
      </p>
    </div>
  );
}

function NotificationTargetList({
  groups,
}: {
  groups: readonly NotificationDesignTargetGroup[];
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredGroups = groups.filter((group) => {
    if (!normalizedQuery) return true;

    return [
      group.name,
      targetTypeLabels[group.type],
      ...group.members.flatMap((member) => [
        member.name,
        member.id,
        member.fcmToken ?? "",
      ]),
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
  });

  return (
    <div className="space-y-4">
      <label className="text-text-muted block text-sm" htmlFor="target-search">
        通知対象を検索
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          className="border-border-base bg-surface-base text-text-base placeholder:text-text-subtle focus:border-brand-primary focus:ring-brand-primary/20 h-10 w-full rounded-md border pr-3 pl-9 outline-none focus:ring-2"
          id="target-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="名前・クラス・チームを検索"
          type="search"
          value={query}
        />
      </div>

      <div className="text-text-muted flex items-center justify-between text-sm">
        <span>通知対象</span>
        <span>{filteredGroups.length}件</span>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <TargetGroupCard group={group} key={group.id} />
          ))}
        </div>
      ) : (
        <p className="text-text-muted border-border-base rounded-lg border border-dashed px-4 py-8 text-center text-sm">
          条件に一致する通知対象はありません
        </p>
      )}
    </div>
  );
}

function TargetGroupCard({ group }: { group: NotificationDesignTargetGroup }) {
  return (
    <section className="border-border-base bg-surface-base overflow-hidden rounded-lg border">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <span className="bg-surface-muted text-text-muted rounded px-2 py-1 text-xs">
          {targetTypeLabels[group.type]}
        </span>
        <h3 className="text-text-base min-w-0 flex-1 font-medium">
          {group.name}
        </h3>
        <span className="text-text-muted text-sm">{group.count}人</span>
      </div>
      <div className="border-border-base border-t px-4 py-3">
        {group.members.length > 0 ? (
          <div className="space-y-2">
            <p className="text-text-muted text-xs">対象ユーザー</p>
            <div className="space-y-2">
              {group.members.map((member) => (
                <details
                  className="border-border-base bg-surface-muted rounded-md border"
                  key={group.id + "-" + member.id}
                >
                  <summary className="text-text-base flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    <UserRound
                      aria-hidden="true"
                      className="text-text-muted size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {member.name}
                    </span>
                    <span className="text-text-muted text-xs">詳細を表示</span>
                  </summary>
                  <div className="border-border-base space-y-1 border-t px-3 py-2 text-xs">
                    <p className="text-text-muted">
                      ユーザーID:{" "}
                      <span className="text-text-base">{member.id}</span>
                    </p>
                    <p className="text-text-muted break-all">
                      FCMトークン:{" "}
                      <span className="text-text-base">
                        {member.fcmToken ?? "未設定"}
                      </span>
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-sm">
            グループ対象（メンバー詳細は配信処理接続後に表示）
          </p>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: keyof typeof statusLabels }) {
  const statusDefinition = statusLabels[status];
  const Icon = statusDefinition.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${statusDefinition.className}`}
    >
      <Icon aria-hidden="true" className="size-4" />
      {statusDefinition.label}
    </span>
  );
}

const statusLabels = {
  draft: { className: "text-text-muted", icon: Clock3, label: "下書き" },
  failed: { className: "text-danger", icon: XCircle, label: "配信失敗" },
  sending: { className: "text-warning", icon: Clock3, label: "配信中" },
  sent: { className: "text-success", icon: CheckCircle2, label: "配信済み" },
} as const;

function statusIcon(status: keyof typeof statusLabels) {
  return statusLabels[status].icon;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
