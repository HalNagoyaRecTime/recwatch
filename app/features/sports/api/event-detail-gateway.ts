import type { EventDetail } from "~/features/sports/model/event-detail";

export type EventDetailGateway = {
  /** Event 1 件を基本情報と Round ごとの集合付きで読み込む。 */
  load(eventId: number): Promise<EventDetail>;
};
