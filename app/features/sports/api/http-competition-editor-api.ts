import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { apiClient } from "~/lib/api-client";

type VenueDto = {
  venue_id: number;
  venue_name: string;
};

type EventDto = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venues: VenueDto[];
  start_time: string;
  end_time: string;
};

function formatTimeForDisplay(value: string): string {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

function toRequest(input: Parameters<CompetitionEditorApi["create"]>[0]) {
  return {
    event_name: input.name,
    rule_text: input.rules,
    venue_ids: input.venueIds,
    start_time: input.startTime.replace(":", ""),
    end_time: input.endTime.replace(":", ""),
  };
}

export const httpCompetitionEditorApi: CompetitionEditorApi = {
  async create(input) {
    const response = await apiClient.post<EventDto>(
      "/api/v1/events",
      toRequest(input)
    );
    return { id: response.event_id };
  },
  async get(eventId) {
    const response = await apiClient.get<EventDto>(`/api/v1/events/${eventId}`);
    return {
      endTime: formatTimeForDisplay(response.end_time),
      name: response.event_name,
      rules: response.rule_text ?? "",
      startTime: formatTimeForDisplay(response.start_time),
      venueIds: response.venues.map((venue) => venue.venue_id),
    };
  },
  async listVenues() {
    const response = await apiClient.get<VenueDto[]>("/api/v1/venues");
    return response.map((venue) => ({
      id: venue.venue_id,
      name: venue.venue_name,
    }));
  },
  async update(eventId, input) {
    await apiClient.put(`/api/v1/events/${eventId}`, toRequest(input));
  },
};
