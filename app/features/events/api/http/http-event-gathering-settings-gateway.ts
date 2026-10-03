import type { EventGatheringSettingsGateway } from "~/features/events/api/contracts/event-gathering-settings-gateway";
import type { EventDetailResponseDto } from "~/features/events/api/dto/event-api-dto";
import type { EventGatheringSettingsResponseDto } from "~/features/events/api/dto/event-gathering-settings-api-dto";
import {
  toEventGatheringSettings,
  toEventGatheringSettingsWriteRequest,
} from "~/features/events/api/mappers/event-gathering-settings-mappers";

type EventGatheringSettingsHttpClient = {
  get<T>(path: string): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGatheringSetting(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.gathering_spot)) return false;
  return (
    Number.isSafeInteger(value.gathering_id) &&
    Number(value.gathering_id) > 0 &&
    typeof value.gathering_time === "string" &&
    Number.isSafeInteger(value.gathering_spot.gathering_spot_id) &&
    Number(value.gathering_spot.gathering_spot_id) > 0 &&
    typeof value.gathering_spot.gathering_spot_name === "string" &&
    Number.isSafeInteger(value.member_count) &&
    Number(value.member_count) >= 0
  );
}

function parseResponse(value: unknown): EventGatheringSettingsResponseDto {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.event_id) ||
    Number(value.event_id) <= 0 ||
    !Array.isArray(value.rounds) ||
    !value.rounds.every(
      (round) =>
        isRecord(round) &&
        Number.isSafeInteger(round.round) &&
        Array.isArray(round.gatherings) &&
        round.gatherings.every(isGatheringSetting)
    )
  ) {
    throw new Error("集合設定のレスポンス形式が正しくありません。");
  }

  return value as unknown as EventGatheringSettingsResponseDto;
}

export function createHttpEventGatheringSettingsGateway(
  client: EventGatheringSettingsHttpClient
): EventGatheringSettingsGateway {
  return {
    // Event 詳細が Round ごとの集合を人数付きで返すため、それを読み込み元にする。
    // 参加者の ID は集合ごとに参加者ピッカーを開いたときに読むので、ここでは読み足さない。
    async load(eventId) {
      const response = await client.get<EventDetailResponseDto>(
        `/api/v1/events/${eventId}`
      );
      return toEventGatheringSettings(parseResponse(response));
    },

    async save(eventId, input) {
      const response = await client.put<EventGatheringSettingsResponseDto>(
        `/api/v1/events/${eventId}/gatherings`,
        toEventGatheringSettingsWriteRequest(input)
      );
      return toEventGatheringSettings(parseResponse(response));
    },
  };
}
