/**
 * Event 単位の集合設定。API から読み込んだ確定済みの状態を表す。
 * 読み込み元（旧集合予定一覧 / 保存後レスポンス）が違っても、この形へ正規化する。
 */
export type GatheringSpotSummary = {
  id: number;
  name: string;
};

export type GatheringSetting = {
  id: number;
  time: string;
  spot: GatheringSpotSummary;
  /** 登録済みの参加人数。参加者の ID は含まず、集合ごとに参加者ピッカーで別途読み込む。 */
  memberCount: number;
};

export type RoundSetting = {
  round: number;
  gatherings: GatheringSetting[];
};

export type EventGatheringSettings = {
  eventId: number;
  rounds: RoundSetting[];
};

/**
 * 画面で編集中の集合設定。確定済みの状態とは別に持ち、保存時に書き込み入力へ変換する。
 * key は React の描画用で、API へは送らない。
 */
export type GatheringDraft = {
  key: string;
  /** null は未保存の新規行。保存済みの行は API 上の ID を保持し、更新として送る。 */
  gatheringId: number | null;
  /** "HH:mm"。未入力は空文字。 */
  time: string;
  spotId: number | null;
  /**
   * サーバーに登録済みの参加人数。参加者がいる集合は保存 API が削除を拒否するため、
   * 画面でも削除できないようにする判断に使う。
   * 参加者はこの下書きとは別に集合ごとの参加者ピッカーで保存し、保存後に人数だけ反映する。
   */
  savedMemberCount: number;
};

export type RoundDraft = {
  key: string;
  round: number;
  gatherings: GatheringDraft[];
};

/** 保存 API へ渡す入力。 */
export type GatheringWriteInput = {
  gatheringId: number | null;
  time: string;
  spotId: number;
};

export type RoundWriteInput = {
  round: number;
  gatherings: GatheringWriteInput[];
};

export type EventGatheringSettingsWriteInput = {
  rounds: RoundWriteInput[];
};

/** 旧 API で集合時刻が未設定のまま作成された行に入っている値。画面では未入力として扱う。 */
export const UNSET_GATHERING_TIME = "99:59";

export const MIN_ROUND = 1;
export const MAX_ROUND = 99;

/**
 * PUT /gatherings/:gatheringId/members の user_ids は 30 件が上限。
 * D1 のバインド変数（1 人あたり 2 個・1 クエリ 100 個まで）に由来するため、
 * 保存して 400 を受け取る前に画面側でも同じ値で止める。
 */
export const MAX_GATHERING_MEMBERS = 30;

let draftKeySequence = 0;

export function createDraftKey(): string {
  draftKeySequence += 1;
  return `draft-${draftKeySequence}`;
}

export function createEmptyGatheringDraft(): GatheringDraft {
  return {
    key: createDraftKey(),
    gatheringId: null,
    time: "",
    spotId: null,
    savedMemberCount: 0,
  };
}

/** 既存 Round の最大番号 + 1 で新しい Round を作る。集合行を 1 つ持った状態で始める。 */
export function createEmptyRoundDraft(
  existing: readonly RoundDraft[]
): RoundDraft {
  const maxRound = existing.reduce(
    (max, round) => Math.max(max, round.round),
    0
  );
  return {
    key: createDraftKey(),
    round: Math.min(maxRound + 1, MAX_ROUND),
    gatherings: [createEmptyGatheringDraft()],
  };
}

export function toRoundDrafts(settings: EventGatheringSettings): RoundDraft[] {
  return settings.rounds.map((round) => ({
    key: createDraftKey(),
    round: round.round,
    gatherings: round.gatherings.map((gathering) => ({
      key: createDraftKey(),
      gatheringId: gathering.id,
      time: gathering.time === UNSET_GATHERING_TIME ? "" : gathering.time,
      spotId: gathering.spot.id,
      savedMemberCount: gathering.memberCount,
    })),
  }));
}

/** 参加者が登録されている集合は、保存 API が削除を拒否するため画面でも削除させない。 */
export function canRemoveGathering(gathering: GatheringDraft): boolean {
  return gathering.savedMemberCount === 0;
}

export function canRemoveRound(round: RoundDraft): boolean {
  return round.gatherings.every(canRemoveGathering);
}
