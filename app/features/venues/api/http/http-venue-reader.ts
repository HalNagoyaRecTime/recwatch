import type { VenueOption, VenueReader } from "~/features/venues/public";
import type { VenueResponseDto } from "~/features/venues/api/dto/venue-api-dto";
import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

type VenueReaderHttpClient = {
  get(path: string): Promise<unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVenueDto(value: unknown): value is VenueResponseDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.venue_id) &&
    Number(value.venue_id) > 0 &&
    typeof value.venue_name === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function toOption(value: VenueResponseDto): VenueOption {
  return { id: value.venue_id, name: value.venue_name };
}

function parsePage(value: unknown): { items: VenueOption[]; total: number } {
  if (Array.isArray(value) && value.every(isVenueDto)) {
    return { items: value.map(toOption), total: value.length };
  }

  if (
    isRecord(value) &&
    Array.isArray(value.venues) &&
    value.venues.every(isVenueDto) &&
    Number.isSafeInteger(value.total) &&
    Number(value.total) >= 0
  ) {
    return {
      items: value.venues.map(toOption),
      total: Number(value.total),
    };
  }

  throw new Error("実施場所のレスポンス形式が正しくありません。");
}

export function createHttpVenueReader(
  client: VenueReaderHttpClient = apiClient
): VenueReader {
  return {
    async listAll() {
      return loadAllPages(async (offset, limit) => {
        const page = parsePage(
          await client.get(`/api/v1/venues?limit=${limit}&offset=${offset}`)
        );
        return page;
      });
    },
  };
}

export const httpVenueReader = createHttpVenueReader();
