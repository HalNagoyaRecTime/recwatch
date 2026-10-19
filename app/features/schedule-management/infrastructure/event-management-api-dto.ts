export type EventApiDto = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venue: string;
  start_time: string;
  end_time: string;
};

export type EventPageApiDto = {
  events: EventApiDto[];
  total: number;
  limit: number;
  offset: number;
};
