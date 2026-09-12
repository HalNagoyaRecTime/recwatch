import { useNavigate, useOutletContext, useParams } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";

import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import { GatheringSettingsStep } from "~/features/event-gatherings/components/GatheringSettingsStep";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { CompetitionListOutletContext } from "~/features/sports/pages/CompetitionListPage";

type EventGatheringSettingsPageProps = {
  memberGateway?: GatheringMemberGateway;
  settingsGateway?: EventGatheringSettingsGateway;
  spotGateway?: GatheringSpotGateway;
};

/**
 * 既存 Event の集合設定をイベント一覧の上にモーダルで開く。
 */
export function EventGatheringSettingsPage({
  memberGateway,
  settingsGateway,
  spotGateway,
}: EventGatheringSettingsPageProps) {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  // 一覧の子ルートとして開かれた場合のみ受け取れる。テストなど単体描画時は undefined。
  const outletContext = useOutletContext<
    CompetitionListOutletContext | undefined
  >();
  const eventId = Number(competitionId);
  const isValidEventId = Number.isInteger(eventId) && eventId > 0;

  return (
    <FormModal
      description="Roundごとの集合時間・集合場所を編集します。"
      onClose={() => navigate("/events")}
      size="xl"
      title="集合設定"
    >
      {(requestClose) =>
        isValidEventId ? (
          <GatheringSettingsStep
            backLabel="キャンセル"
            eventId={eventId}
            memberGateway={memberGateway}
            onBack={requestClose}
            onSaved={() => {
              outletContext?.reload();
              requestClose();
            }}
            settingsGateway={settingsGateway}
            spotGateway={spotGateway}
          />
        ) : (
          <p className="text-tone-danger-text text-base" role="alert">
            イベントIDが不正です。
          </p>
        )
      }
    </FormModal>
  );
}
