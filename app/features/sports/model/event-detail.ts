import type {
  GatheringSetting,
  RoundSetting,
} from "~/features/event-gatherings/model/event-gathering-settings";
import type { CompetitionVenue } from "~/features/sports/model/competition-venue";

/**
 * Event 詳細画面で表示する Event。基本情報と Round ごとの集合を 1 つにまとめる。
 * 集合の形は集合設定と同じ正規化済みの型を使い、詳細と集合設定で変換を重複させない。
 */
export type EventDetail = {
  id: number;
  name: string;
  venues: CompetitionVenue[];
  /** "HH:mm"。 */
  startTime: string;
  endTime: string;
  /** ルール・備考。未設定は null。 */
  rules: string | null;
  rounds: RoundSetting[];
};

/** 集合の登録済み参加人数。読み込み元に含まれない場合は 0 として扱う。 */
export function getGatheringMemberCount(gathering: GatheringSetting): number {
  return gathering.memberCount ?? 0;
}

/** Round に登録済みの参加人数の合計。 */
export function sumRoundMemberCount(
  gatherings: readonly GatheringSetting[]
): number {
  return gatherings.reduce(
    (total, gathering) => total + getGatheringMemberCount(gathering),
    0
  );
}
