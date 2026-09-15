import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type {
  EventGatheringSettingsResponseDto,
  GatheringMemberResponseDto,
} from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import {
  toEventGatheringSettings,
  toEventGatheringSettingsWriteRequest,
} from "~/features/event-gatherings/api/mappers/event-gathering-settings-mappers";

type EventGatheringSettingsHttpClient = {
  get<T>(path: string): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

export function createHttpEventGatheringSettingsGateway(
  client: EventGatheringSettingsHttpClient
): EventGatheringSettingsGateway {
  return {
    // Event 詳細が Round ごとの集合を人数付きで返すため、それを読み込み元にする。
    // 詳細には参加者の ID までは含まれないため、ピッカーの初期選択用に
    // 集合ごとの参加者一覧を読み足している。
    async load(eventId) {
      const response = await client.get<EventGatheringSettingsResponseDto>(
        `/api/v1/events/${eventId}`
      );
      const gatheringIds = response.rounds.flatMap((round) =>
        round.gatherings.map((gathering) => gathering.gathering_id)
      );
      const membersByGatheringId = new Map(
        await Promise.all(
          gatheringIds.map(async (gatheringId) => {
            const members = await client.get<GatheringMemberResponseDto[]>(
              `/api/v1/gatherings/${gatheringId}/members`
            );
            return [gatheringId, members] as const;
          })
        )
      );
      return toEventGatheringSettings(response, membersByGatheringId);
    },

    async save(eventId, input) {
      const response = await client.put<EventGatheringSettingsResponseDto>(
        `/api/v1/events/${eventId}/gatherings`,
        toEventGatheringSettingsWriteRequest(input)
      );
      return toEventGatheringSettings(response);
    },
  };
}
