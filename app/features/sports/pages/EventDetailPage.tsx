import { ArrowLeft, Pencil, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useParams } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { getErrorMessage } from "~/lib/client-error";
import type { EventDetailGateway } from "~/features/sports/api/event-detail-gateway";
import { httpEventDetailGateway } from "~/features/sports/api/http-event-detail-gateway";
import { EventBasicInfoCard } from "~/features/sports/components/EventBasicInfoCard";
import { EventGatheringRounds } from "~/features/sports/components/EventGatheringRounds";
import type { EventDetail } from "~/features/sports/model/event-detail";

type EventDetailPageProps = {
  gateway?: EventDetailGateway;
};

/** 子ルート（集合設定モーダル）から詳細の再取得を依頼するための受け渡し口。 */
export type EventDetailOutletContext = {
  reload: () => void;
};

/**
 * Event 1 件の確認と、集合設定へ進むためのハブ。
 * 集合設定モーダルはこのページの子ルートとして開き、閉じるとここへ戻る。
 */
export function EventDetailPage({
  gateway = httpEventDetailGateway,
}: EventDetailPageProps) {
  const { competitionId } = useParams();
  const eventId = Number(competitionId);
  const isValidEventId = Number.isInteger(eventId) && eventId > 0;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const outletContext = useMemo<EventDetailOutletContext>(
    () => ({ reload }),
    [reload]
  );

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(async () => {
      if (!isCurrent) return;
      setIsLoading(true);
      setLoadError(null);

      if (!isValidEventId) {
        setLoadError("イベントIDが不正です。");
        setIsLoading(false);
        return;
      }

      try {
        const value = await gateway.load(eventId);
        if (isCurrent) setEvent(value);
      } catch (error) {
        if (!isCurrent) return;
        setLoadError(
          getErrorMessage(error, "イベントデータの取得に失敗しました。")
        );
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [eventId, gateway, isValidEventId, reloadToken]);

  const gatheringSettingsPath = `/events/${eventId}/gatherings`;

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink icon={ArrowLeft} size="lg" to="/events">
              一覧へ戻る
            </ButtonLink>
            {isValidEventId ? (
              <>
                <ButtonLink
                  icon={Pencil}
                  size="lg"
                  to={`/events/${eventId}/edit`}
                >
                  編集
                </ButtonLink>
                <ButtonLink
                  icon={Users}
                  size="lg"
                  to={gatheringSettingsPath}
                  variant="primary"
                >
                  集合を設定する
                </ButtonLink>
              </>
            ) : null}
          </div>
        }
        description="イベントに関する情報の確認と、集合設定を行うためのハブです"
        title="イベント詳細"
      />

      {loadError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError}
        </p>
      ) : isLoading || !event ? (
        <p className="text-text-muted text-sm">イベントを読み込んでいます...</p>
      ) : (
        <>
          <h2 className="text-text-base text-2xl font-semibold">
            {event.name}
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <EventBasicInfoCard event={event} />
            <EventGatheringRounds
              gatheringSettingsPath={gatheringSettingsPath}
              rounds={event.rounds}
            />
          </div>
        </>
      )}

      <Outlet context={outletContext} />
    </div>
  );
}
