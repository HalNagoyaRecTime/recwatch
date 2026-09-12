import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type {
  EventGatheringSettingsResponseDto,
  GatheringMemberResponseDto,
  LegacyEventGatheringResponseDto,
} from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import {
  toEventGatheringSettings,
  toEventGatheringSettingsFromLegacyList,
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
    // 読み込みは旧形式の集合予定一覧に依存している。一覧に参加者が含まれないため、
    // 集合ごとに参加者一覧を読み足す。Event 詳細 API が Round 構造と参加者を返す
    // ようになったら、この 1 か所を差し替える。
    async load(eventId) {
      const response = await client.get<LegacyEventGatheringResponseDto[]>(
        `/api/v1/events/${eventId}/gatherings`
      );
      const membersByGatheringId = new Map(
        await Promise.all(
          response.map(async (gathering) => {
            const members = await client.get<GatheringMemberResponseDto[]>(
              `/api/v1/gatherings/${gathering.gathering_id}/members`
            );
            return [gathering.gathering_id, members] as const;
          })
        )
      );
      return toEventGatheringSettingsFromLegacyList(
        eventId,
        response,
        membersByGatheringId
      );
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
