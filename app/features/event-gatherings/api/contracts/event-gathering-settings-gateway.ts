import type {
  EventGatheringSettings,
  EventGatheringSettingsWriteInput,
} from "~/features/event-gatherings/model/event-gathering-settings";

export interface EventGatheringSettingsGateway {
  /** Event 配下の集合設定を Round ごとにまとめた形で読み込む。 */
  load(eventId: number): Promise<EventGatheringSettings>;
  /** Event 単位で集合設定を置き換え、保存後の正規化済みの状態を返す。 */
  save(
    eventId: number,
    input: EventGatheringSettingsWriteInput
  ): Promise<EventGatheringSettings>;
}
