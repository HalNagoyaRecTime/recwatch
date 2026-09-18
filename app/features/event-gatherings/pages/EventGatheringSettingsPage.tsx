import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";

import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import { GatheringSettingsSavedStep } from "~/features/event-gatherings/components/GatheringSettingsSavedStep";
import { GatheringSettingsStep } from "~/features/event-gatherings/components/GatheringSettingsStep";
import type { EventGatheringSettings } from "~/features/event-gatherings/model/event-gathering-settings";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { EventDetailOutletContext } from "~/features/sports/pages/EventDetailPage";

type EventGatheringSettingsPageProps = {
  memberGateway?: GatheringMemberGateway;
  settingsGateway?: EventGatheringSettingsGateway;
  spotGateway?: GatheringSpotGateway;
};

/**
 * 既存 Event の集合設定をイベント詳細の上にモーダルで開く。閉じると詳細へ戻る。
 */
export function EventGatheringSettingsPage({
  memberGateway,
  settingsGateway,
  spotGateway,
}: EventGatheringSettingsPageProps) {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  // 詳細の子ルートとして開かれた場合のみ受け取れる。テストなど単体描画時は undefined。
  const outletContext = useOutletContext<
    EventDetailOutletContext | undefined
  >();
  const [savedSettings, setSavedSettings] =
    useState<EventGatheringSettings | null>(null);
  const eventId = Number(competitionId);
  const isValidEventId = Number.isInteger(eventId) && eventId > 0;
  // ID が不正なら詳細も表示できないため一覧へ戻す
  const closePath = isValidEventId ? `/events/${eventId}` : "/events";

  return (
    <FormModal
      description={
        savedSettings
          ? "集合設定の保存が完了しました。"
          : "Roundごとの集合時間・集合場所を編集します。"
      }
      onClose={() => navigate(closePath)}
      size="xl"
      title="集合設定"
    >
      {(requestClose) =>
        !isValidEventId ? (
          <p className="text-tone-danger-text text-base" role="alert">
            イベントIDが不正です。
          </p>
        ) : savedSettings ? (
          <GatheringSettingsSavedStep
            onClose={requestClose}
            settings={savedSettings}
          />
        ) : (
          <GatheringSettingsStep
            backLabel="キャンセル"
            eventId={eventId}
            memberGateway={memberGateway}
            onBack={requestClose}
            onSaved={(settings) => {
              outletContext?.reload();
              setSavedSettings(settings);
            }}
            settingsGateway={settingsGateway}
            spotGateway={spotGateway}
          />
        )
      }
    </FormModal>
  );
}
