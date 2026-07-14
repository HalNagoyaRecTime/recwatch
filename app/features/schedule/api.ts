import { apiClient } from "~/lib/api-client";

export type ScheduleType = "ceremony" | "competition" | "break" | "other";

export type ScheduleDTO = {
  schedule_id: number;
  schedule_type: ScheduleType;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  order: number;
};

export type SchedulesResponseDTO = {
  schedules: ScheduleDTO[];
  total: number;
};

export const scheduleApi = {
  getSchedules: () => apiClient.get<SchedulesResponseDTO>("/api/v1/schedules"),
};
