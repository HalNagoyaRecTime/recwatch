/**
 * GET /api/v1/events/:eventId/gatherings の 1 件。
 * 集合予定をフラットに返す旧形式で、参加人数は含まれない。
 * Event 詳細 API が Round 構造を返すようになったら、この DTO は不要になる。
 */
export type LegacyEventGatheringResponseDto = {
  gathering_id: number;
  event_id: number;
  gathering_spot_id: number;
  gathering_time: string;
  round: number;
  event_name: string;
  gathering_spot_name: string;
  created_at: string;
  updated_at: string;
};

/** GET /api/v1/gatherings/:gatheringId/members の 1 件。参加者の user_id だけを使う。 */
export type GatheringMemberResponseDto = {
  gathering_group_member_id: number;
  gathering_id: number;
  user_id: number;
};

/** PUT /api/v1/events/:eventId/gatherings のリクエスト。 */
export type GatheringSettingWriteRequestDto = {
  gathering_id?: number;
  gathering_time: string;
  gathering_spot_id: number;
};

export type RoundSettingWriteRequestDto = {
  round: number;
  gatherings: GatheringSettingWriteRequestDto[];
};

export type EventGatheringSettingsWriteRequestDto = {
  rounds: RoundSettingWriteRequestDto[];
};

/** PUT /api/v1/events/:eventId/gatherings のレスポンス。保存後の正規化済みの一覧。 */
export type GatheringSpotSummaryResponseDto = {
  gathering_spot_id: number;
  gathering_spot_name: string;
};

export type GatheringSettingResponseDto = {
  gathering_id: number;
  gathering_time: string;
  gathering_spot: GatheringSpotSummaryResponseDto;
  member_count: number;
};

export type RoundSettingResponseDto = {
  round: number;
  gatherings: GatheringSettingResponseDto[];
};

export type EventGatheringSettingsResponseDto = {
  event_id: number;
  rounds: RoundSettingResponseDto[];
};
