import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type { EventGatheringSettingsResponseDto } from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
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
    // 参加者の ID は集合ごとに参加者ピッカーを開いたときに読むので、ここでは読み足さない。
    async load(eventId) {
      const response = await client.get<EventGatheringSettingsResponseDto>(
        `/api/v1/events/${eventId}`
      );
      return toEventGatheringSettings(response);
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
