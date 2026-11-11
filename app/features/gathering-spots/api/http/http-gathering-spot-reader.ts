import type {
  GatheringSpotOption,
  GatheringSpotReader,
} from "~/features/gathering-spots/public";
import type { GatheringSpotResponseDto } from "~/features/gathering-spots/api/dto/gathering-spot-api-dto";
import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

type GatheringSpotReaderHttpClient = {
  get(path: string): Promise<unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGatheringSpotDto(value: unknown): value is GatheringSpotResponseDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.gathering_spot_id) &&
    Number(value.gathering_spot_id) > 0 &&
    typeof value.gathering_spot_name === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function toOption(value: GatheringSpotResponseDto): GatheringSpotOption {
  return { id: value.gathering_spot_id, name: value.gathering_spot_name };
}

function parsePage(value: unknown): {
  items: GatheringSpotOption[];
  total: number;
} {
  if (Array.isArray(value) && value.every(isGatheringSpotDto)) {
    return { items: value.map(toOption), total: value.length };
  }

  if (
    isRecord(value) &&
    Array.isArray(value.gathering_spots) &&
    value.gathering_spots.every(isGatheringSpotDto) &&
    Number.isSafeInteger(value.total) &&
    Number(value.total) >= 0
  ) {
    return {
      items: value.gathering_spots.map(toOption),
      total: Number(value.total),
    };
  }

  throw new Error("集合場所のレスポンス形式が正しくありません。");
}

export function createHttpGatheringSpotReader(
  client: GatheringSpotReaderHttpClient = apiClient
): GatheringSpotReader {
  return {
    async listAll() {
      return loadAllPages(async (offset, limit) => {
        const page = parsePage(
          await client.get(
            `/api/v1/gathering-spots?limit=${limit}&offset=${offset}`
          )
        );
        return page;
      });
    },
  };
}

export const httpGatheringSpotReader = createHttpGatheringSpotReader();
