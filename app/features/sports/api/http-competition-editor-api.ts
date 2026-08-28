import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { apiClient } from "~/lib/api-client";

type EventDto = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venue: string;
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
    venue: input.venue,
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
      venue: response.venue,
    };
  },
  async update(eventId, input) {
    await apiClient.put(`/api/v1/events/${eventId}`, toRequest(input));
  },
};
