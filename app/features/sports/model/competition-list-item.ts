/** Event 一覧 API が Event ごとに返す集合の概要。集合場所や Round の内訳は含まない。 */
export type CompetitionGatheringSummary = {
  /** Event に紐づく集合の総数。 */
  gatheringCount: number;
  /** 集合時刻・集合場所が両方設定済みの集合の数。 */
  configuredGatheringCount: number;
  /** 設定済みの集合時刻のうち最も早いもの（"HH:mm"）。1 件もなければ null。 */
  firstGatheringTime: string | null;
};

export type CompetitionListItem = {
  id: number;
  code: string;
  name: string;
  venue: string;
  startTime: string;
  endTime: string;
  gatheringSummary: CompetitionGatheringSummary;
  rules: string;
};
