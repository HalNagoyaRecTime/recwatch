import type { ScheduleDTO, ScheduleType } from "~/features/schedule/api";

export type Schedule = {
  id: number;
  type: ScheduleType;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  order: number;
};

export function toSchedule(dto: ScheduleDTO): Schedule {
  return {
    id: dto.schedule_id,
    type: dto.schedule_type,
    name: dto.name,
    description: dto.description,
    startTime: dto.start_time,
    endTime: dto.end_time,
    location: dto.location,
    order: dto.order,
  };
}
