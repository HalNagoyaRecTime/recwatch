import { Clock, MapPin, Plus, Users } from "lucide-react";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import type { RoundSetting } from "~/features/event-gatherings/model/event-gathering-settings";
import { UNSET_GATHERING_TIME } from "~/features/event-gatherings/model/event-gathering-settings";
import {
  getGatheringMemberCount,
  sumRoundMemberCount,
} from "~/features/sports/model/event-detail";

type EventGatheringRoundsProps = {
  /** 集合設定モーダルへのパス。追加・編集はここで行い、この一覧は表示だけを受け持つ。 */
  gatheringSettingsPath: string;
  rounds: readonly RoundSetting[];
};

/**
 * Event 詳細の集合設定を Round ごとに一覧で見せる。
 * 集合 1 件を 1 行で表し、参加者の確認・編集はこの行から進める前提の構造にしている。
 */
export function EventGatheringRounds({
  gatheringSettingsPath,
  rounds,
}: EventGatheringRoundsProps) {
  return (
    <section
      aria-labelledby="event-gatherings-heading"
      className="border-border-base app-rounded space-y-4 border p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-text-base flex items-center gap-2 text-base font-semibold"
          id="event-gatherings-heading"
        >
          <Users aria-hidden="true" className="text-brand-primary size-4" />
          集合設定
        </h2>
        <ButtonLink icon={Plus} size="sm" to={gatheringSettingsPath}>
          集合を追加
        </ButtonLink>
      </div>

      {rounds.length === 0 ? (
        <p className="text-text-muted text-sm">
          集合設定がまだありません。「集合を設定する」から登録してください。
        </p>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => (
            <section
              key={round.round}
              aria-label={`Round ${round.round}`}
              className="bg-surface-muted app-rounded space-y-2 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="bg-brand-primary text-text-base-inverse inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold">
                    {index + 1}
                  </span>
                  <h3 className="text-text-base text-sm font-semibold">
                    Round {round.round}
                  </h3>
                </div>
                <span className="app-rounded bg-surface-base text-text-muted px-2 py-1 text-xs font-medium whitespace-nowrap">
                  合計 {sumRoundMemberCount(round.gatherings)}名
                </span>
              </div>
              <ul className="space-y-2">
                {round.gatherings.map((gathering) => (
                  <li
                    key={gathering.id}
                    className="border-border-subtle bg-surface-base app-rounded flex flex-wrap items-center gap-x-6 gap-y-1 border px-3 py-2 text-sm"
                  >
                    <span className="text-text-base inline-flex items-center gap-1.5">
                      <Clock
                        aria-hidden="true"
                        className="text-text-muted size-4"
                      />
                      {gathering.time === UNSET_GATHERING_TIME
                        ? "未設定"
                        : gathering.time}
                    </span>
                    <span className="text-text-base inline-flex items-center gap-1.5">
                      <MapPin
                        aria-hidden="true"
                        className="text-text-muted size-4"
                      />
                      {gathering.spot.name}
                    </span>
                    <span className="text-text-base inline-flex items-center gap-1.5">
                      <Users
                        aria-hidden="true"
                        className="text-text-muted size-4"
                      />
                      {getGatheringMemberCount(gathering)}名
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
