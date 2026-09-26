import type {
  EventGatheringSettingsResponseDto,
  EventGatheringSettingsWriteRequestDto,
} from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import type {
  EventGatheringSettings,
  EventGatheringSettingsWriteInput,
} from "~/features/event-gatherings/model/event-gathering-settings";

/**
 * Round ごとにまとまったレスポンスを集合設定へ変換する。
 * レスポンスは参加人数だけを返し、参加者の ID は含まない。
 * 参加者は集合ごとに参加者ピッカーを開いたときに別途読み込む。
 */
export function toEventGatheringSettings(
  response: EventGatheringSettingsResponseDto
): EventGatheringSettings {
  return {
    eventId: response.event_id,
    rounds: response.rounds.map((round) => ({
      round: round.round,
      gatherings: round.gatherings.map((gathering) => ({
        id: gathering.gathering_id,
        time: gathering.gathering_time,
        spot: {
          id: gathering.gathering_spot.gathering_spot_id,
          name: gathering.gathering_spot.gathering_spot_name,
        },
        memberCount: gathering.member_count,
      })),
    })),
  };
}

export function toEventGatheringSettingsWriteRequest(
  input: EventGatheringSettingsWriteInput
): EventGatheringSettingsWriteRequestDto {
  return {
    rounds: input.rounds.map((round) => ({
      round: round.round,
      gatherings: round.gatherings.map((gathering) => ({
        // 新規行は gathering_id を送らない。API は省略を新規作成として扱う。
        ...(gathering.gatheringId === null
          ? {}
          : { gathering_id: gathering.gatheringId }),
        gathering_time: gathering.time,
        gathering_spot_id: gathering.spotId,
      })),
    })),
  };
}
