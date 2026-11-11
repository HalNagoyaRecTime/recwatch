import type { EventDetail } from "~/features/events/model/event-detail";

export type EventListOutletContext = {
  reload: () => void;
};

/** 子ルート（集合設定モーダル）から詳細の再取得を依頼するための受け渡し口。 */
export type EventDetailOutletContext = {
  event: EventDetail | null;
  reload: () => void;
};
