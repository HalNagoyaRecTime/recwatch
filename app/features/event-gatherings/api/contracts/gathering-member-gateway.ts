import type { GatheringMemberCandidates } from "~/features/event-gatherings/model/gathering-member-candidate";

export interface GatheringMemberGateway {
  /** 参加者ピッカーの選択候補（全クラス・全学生）を読み込む。 */
  loadCandidates(): Promise<GatheringMemberCandidates>;
  /**
   * 集合 1 件の参加者を選択内容で置き換える。
   * 送信方法・形式は未確定のため、現在の実装は保存を行わない。
   */
  saveMembers(gatheringId: number, userIds: readonly number[]): Promise<void>;
}
