import type {
  EventGatheringSettingsResponseDto,
  EventGatheringSettingsWriteRequestDto,
  GatheringMemberResponseDto,
} from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import type {
  EventGatheringSettings,
  EventGatheringSettingsWriteInput,
} from "~/features/event-gatherings/model/event-gathering-settings";

const NO_MEMBERS: ReadonlyMap<number, readonly GatheringMemberResponseDto[]> =
  new Map();

/**
 * Round ごとにまとまったレスポンスを集合設定へ変換する。
 * レスポンス自体は人数だけを返し参加者の ID までは含まないため、
 * 集合ごとに別途読んだ参加者があれば `membersByGatheringId` で受け取る。
 */
export function toEventGatheringSettings(
  response: EventGatheringSettingsResponseDto,
  membersByGatheringId: ReadonlyMap<
    number,
    readonly GatheringMemberResponseDto[]
  > = NO_MEMBERS
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
        memberUserIds: (
          membersByGatheringId.get(gathering.gathering_id) ?? []
        ).map((member) => member.user_id),
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
