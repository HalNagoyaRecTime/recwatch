import type { ReactNode } from "react";

import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";
import type { AdminNotificationDetail } from "~/features/notifications/api/contracts/admin-notification-types";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

const importanceLabels = { low: "低", normal: "通常", high: "高" };
const audienceLabels = {
  all: "全員",
  user: "ユーザー",
  class_room: "クラス",
  gathering: "集合",
  event: "イベント",
};

function formatDateTime(value: string | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function InformationRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-border-subtle grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] border-b last:border-b-0">
      <dt className="text-text-muted bg-surface-muted px-4 py-3 text-sm">
        {label}
      </dt>
      <dd className="text-text-base min-w-0 px-4 py-3 text-sm break-words">
        {children}
      </dd>
    </div>
  );
}

export function NotificationInformationPreview({
  draft,
  notification,
  audienceOptions = [],
}: {
  draft: NotificationDraft;
  notification?: AdminNotificationDetail | null;
  audienceOptions?: NotificationAudienceOption[];
}) {
  const creation = notification?.creation;
  const isAutomatic = creation?.method === "automatic";
  const isScheduled = draft.deliveryTiming === "scheduled";

  return (
    <div className="w-full min-w-0 space-y-4" aria-label="通知情報プレビュー">
      <LayeredPanel
        padding="none"
        header={<h3 className="px-4 py-3 text-sm font-semibold">通知情報</h3>}
      >
        <dl>
          <InformationRow label="作成方法">
            {isAutomatic ? "自動" : "手動"}
          </InformationRow>
          <InformationRow label="重要度">
            {importanceLabels[draft.importance]}
          </InformationRow>
          {creation?.source ? (
            <InformationRow label="自動生成元">
              <span title={`${creation.source.type} #${creation.source.id}`}>
                {creation.source.label?.trim() || "-"}
              </span>
            </InformationRow>
          ) : null}
          <InformationRow label="配信タイミング">
            {isScheduled ? "予約配信" : "今すぐ配信"}
          </InformationRow>
          <InformationRow label="配信日時">
            {isScheduled
              ? formatDateTime(draft.scheduledAt)
              : "作成後すぐに配信"}
          </InformationRow>
          <InformationRow label="通知対象">
            {draft.audiences.length ? (
              <ul className="space-y-2">
                {draft.audiences.map((audience) => {
                  const option = audienceOptions.find(
                    (item) =>
                      item.type === audience.type &&
                      item.id === audience.targetId
                  );
                  return (
                    <li key={audience.key}>
                      {audience.type === "all" ? (
                        "全員"
                      ) : (
                        <>
                          <span className="text-text-subtle block text-xs">
                            {audienceLabels[audience.type]}
                          </span>
                          {option?.name.trim() || "-"}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              "-"
            )}
          </InformationRow>
        </dl>
      </LayeredPanel>
      <LayeredPanel
        padding="none"
        header={<h3 className="px-4 py-3 text-sm font-semibold">作成情報</h3>}
      >
        <dl>
          <InformationRow label="作成者">
            {creation?.user?.userName.trim() || "-"}
          </InformationRow>
          <InformationRow label="通知ID">
            {notification?.notificationId ?? "-"}
          </InformationRow>
          <InformationRow label="作成日時">
            {formatDateTime(notification?.createdAt)}
          </InformationRow>
          {notification ? (
            <InformationRow label="更新日時">
              {formatDateTime(notification.updatedAt)}
            </InformationRow>
          ) : null}
        </dl>
      </LayeredPanel>
    </div>
  );
}
