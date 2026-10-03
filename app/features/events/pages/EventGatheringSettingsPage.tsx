import { useCallback, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";

import type { EventGatheringSettingsGateway } from "~/features/events/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/events/api/contracts/gathering-member-gateway";
import { GatheringSettingsSavedStep } from "~/features/events/components/GatheringSettingsSavedStep";
import { GatheringSettingsStep } from "~/features/events/components/GatheringSettingsStep";
import type { EventGatheringSettings } from "~/features/events/model/event-gathering-settings";
import type { GatheringSpotReader } from "~/features/gathering-spots/public";
import type { EventDetailOutletContext } from "~/features/events/routes/outlet-context";

type EventGatheringSettingsPageProps = {
  memberGateway: GatheringMemberGateway;
  settingsGateway: EventGatheringSettingsGateway;
  spotReader: GatheringSpotReader;
};

/**
 * 既存 Event の集合設定をイベント詳細の上にモーダルで開く。閉じると詳細へ戻る。
 */
export function EventGatheringSettingsPage({
  memberGateway,
  settingsGateway,
  spotReader,
}: EventGatheringSettingsPageProps) {
  const { eventId: eventIdParam } = useParams();
  const navigate = useNavigate();
  // 詳細の子ルートとして開かれた場合のみ受け取れる。テストなど単体描画時は undefined。
  const outletContext = useOutletContext<
    EventDetailOutletContext | undefined
  >();
  const [savedSettings, setSavedSettings] =
    useState<EventGatheringSettings | null>(null);
  const eventId = Number(eventIdParam);
  const isValidEventId = Number.isInteger(eventId) && eventId > 0;
  // ID が不正なら詳細も表示できないため一覧へ戻す。
  // モーダルは閉じるアニメーション中に onClose が変わると閉じ直すため、関数を固定しておく。
  const closePath = isValidEventId ? `/events/${eventId}` : "/events";
  const handleClose = useCallback(
    () => navigate(closePath),
    [closePath, navigate]
  );

  return (
    <FormModal
      description={
        savedSettings
          ? "集合設定の保存が完了しました。"
          : "Roundごとの集合時間・集合場所を編集します。"
      }
      onClose={handleClose}
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
            onMembersSaved={() => outletContext?.reload()}
            onSaved={(settings) => {
              outletContext?.reload();
              setSavedSettings(settings);
            }}
            settingsGateway={settingsGateway}
            spotReader={spotReader}
          />
        )
      }
    </FormModal>
  );
}
