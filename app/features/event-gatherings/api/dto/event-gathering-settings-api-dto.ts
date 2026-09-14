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

/**
 * Round ごとにまとめた集合設定のレスポンス。
 * PUT /api/v1/events/:eventId/gatherings が保存後の状態として返すほか、
 * GET /api/v1/events/:eventId も Event 本体の項目に加えて同じ形の `rounds` を返す。
 */
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
