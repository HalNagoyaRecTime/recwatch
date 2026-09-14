import type {
  EventGatheringSettingsResponseDto,
  EventGatheringSettingsWriteRequestDto,
  GatheringMemberResponseDto,
  LegacyEventGatheringResponseDto,
} from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import type {
  EventGatheringSettings,
  EventGatheringSettingsWriteInput,
  GatheringSetting,
} from "~/features/event-gatherings/model/event-gathering-settings";

/**
 * 旧形式のフラットな集合予定一覧を Round ごとにまとめる。
 * 一覧には参加者が含まれないため、集合ごとに読んだ参加者を別引数で受け取る。
 * 並びは保存 API のレスポンスと同じ round 昇順・時刻昇順・ID 昇順にそろえる。
 */
export function toEventGatheringSettingsFromLegacyList(
  eventId: number,
  response: readonly LegacyEventGatheringResponseDto[],
  membersByGatheringId: ReadonlyMap<
    number,
    readonly GatheringMemberResponseDto[]
  >
): EventGatheringSettings {
  const byRound = new Map<number, GatheringSetting[]>();
  for (const item of response) {
    const gatherings = byRound.get(item.round) ?? [];
    const memberUserIds = (
      membersByGatheringId.get(item.gathering_id) ?? []
    ).map((member) => member.user_id);
    gatherings.push({
      id: item.gathering_id,
      time: item.gathering_time,
      spot: { id: item.gathering_spot_id, name: item.gathering_spot_name },
      memberUserIds,
      memberCount: memberUserIds.length,
    });
    byRound.set(item.round, gatherings);
  }

  const rounds = [...byRound.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, gatherings]) => ({
      round,
      gatherings: gatherings.sort(
        (a, b) => a.time.localeCompare(b.time) || a.id - b.id
      ),
    }));

  return { eventId, rounds };
}

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
        // 保存後レスポンスは人数だけを返し、参加者の ID までは含まない
        memberUserIds: [],
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
