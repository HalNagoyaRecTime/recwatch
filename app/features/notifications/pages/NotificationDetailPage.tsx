import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Pencil } from "lucide-react";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { NotificationManagementError } from "~/features/notifications/api/contracts/errors/notification-management-error";
import { getNotificationManagementErrorMessage } from "~/features/notifications/hooks/notification-error-messages";
import {
  canModifyNotification,
  type ManagedNotification,
} from "~/features/notifications/model/notification";

type NotificationDetailPageProps = {
  api: NotificationManagementApi;
  notificationId: number;
};

export function NotificationDetailPage({
  api,
  notificationId,
}: NotificationDetailPageProps) {
  const hasValidNotificationId =
    Number.isSafeInteger(notificationId) && notificationId > 0;
  const [notification, setNotification] = useState<ManagedNotification | null>(
    null
  );
  const [loadedNotificationId, setLoadedNotificationId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!hasValidNotificationId) {
      return () => {
        active = false;
      };
    }

    api
      .getById(notificationId)
      .then((result) => {
        if (active) {
          setNotification(result);
          setLoadedNotificationId(notificationId);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setNotification(null);
          setLoadedNotificationId(notificationId);
          setErrorMessage(toErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [api, hasValidNotificationId, notificationId]);

  const isLoadedForCurrentId =
    hasValidNotificationId && loadedNotificationId === notificationId;
  const visibleNotification = isLoadedForCurrentId ? notification : null;
  const visibleError = !hasValidNotificationId
    ? getNotificationManagementErrorMessage("not_found")
    : isLoadedForCurrentId
      ? errorMessage
      : null;
  const isCurrentLoading =
    hasValidNotificationId && (isLoading || !isLoadedForCurrentId);

  return (
    <PageLayout>
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title="通知詳細"
            description="通知の内容と配信状況を確認します"
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink
                  to="/notifications"
                  icon={ArrowLeft}
                  size="md"
                  variant="secondary"
                >
                  通知一覧へ戻る
                </ButtonLink>
                {visibleNotification &&
                canModifyNotification(visibleNotification) ? (
                  <ButtonLink
                    to={`/notifications/${visibleNotification.id}/edit`}
                    icon={Pencil}
                    size="md"
                    variant="primary"
                  >
                    通知を編集
                  </ButtonLink>
                ) : null}
              </div>
            }
          />

          {isCurrentLoading ? (
            <p aria-live="polite" className="text-text-muted text-sm">
              通知を読み込み中...
            </p>
          ) : visibleError || !visibleNotification ? (
            <div aria-live="polite" className="space-y-3" role="alert">
              <p className="text-tone-danger-text text-sm">
                {visibleError ??
                  getNotificationManagementErrorMessage("unexpected")}
              </p>
              <ButtonLink to="/notifications" size="md" variant="secondary">
                通知一覧へ戻る
              </ButtonLink>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <LayeredPanel
                header={
                  <h2 className="text-text-base font-semibold">通知内容</h2>
                }
              >
                <div className="space-y-5">
                  <DetailRow label="タイトル">
                    <p className="text-text-base font-medium">
                      {visibleNotification.title}
                    </p>
                  </DetailRow>
                  <DetailRow label="本文">
                    <p className="text-text-base whitespace-pre-wrap">
                      {visibleNotification.body}
                    </p>
                  </DetailRow>
                  <DetailRow label="通知対象">
                    <p className="text-text-base">
                      {visibleNotification.audienceName}
                    </p>
                  </DetailRow>
                </div>
              </LayeredPanel>

              <LayeredPanel
                header={
                  <h2 className="text-text-base font-semibold">配信情報</h2>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailRow label="状態">
                    <StatusLabel status={visibleNotification.status} />
                  </DetailRow>
                  <DetailRow label="配信日時">
                    <p className="text-text-base">
                      {formatDateTime(visibleNotification.scheduledAt)}
                    </p>
                  </DetailRow>
                  <DetailRow label="作成・配信者">
                    <p className="text-text-base">
                      {visibleNotification.creatorName}
                    </p>
                  </DetailRow>
                  <DetailRow label="配信数">
                    <p className="text-text-base">
                      {visibleNotification.deliverySummary.sent} /{" "}
                      {visibleNotification.deliverySummary.total}
                    </p>
                  </DetailRow>
                  {visibleNotification.relatedEventName ? (
                    <DetailRow label="関連競技">
                      <p className="text-text-base">
                        {visibleNotification.relatedEventName}
                      </p>
                    </DetailRow>
                  ) : null}
                </div>
              </LayeredPanel>
            </div>
          )}
        </div>
      </PagePadding>
    </PageLayout>
  );
}

function DetailRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-text-muted mb-1 text-xs font-medium">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function StatusLabel({ status }: { status: ManagedNotification["status"] }) {
  const labels: Record<ManagedNotification["status"], string> = {
    draft: "未送信",
    sending: "送信中",
    sent: "配信済",
    failed: "送信失敗",
  };

  return (
    <p
      className={
        status === "sent"
          ? "text-tone-success-text font-medium"
          : status === "failed"
            ? "text-tone-danger-text font-medium"
            : "text-text-muted font-medium"
      }
    >
      {labels[status]}
    </p>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toErrorMessage(error: unknown) {
  return getNotificationManagementErrorMessage(
    error instanceof NotificationManagementError ? error.kind : "unexpected"
  );
}
