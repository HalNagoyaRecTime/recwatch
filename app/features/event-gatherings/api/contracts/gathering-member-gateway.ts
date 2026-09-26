import type { GatheringMemberCandidates } from "~/features/event-gatherings/model/gathering-member-candidate";

export interface GatheringMemberGateway {
  /** 参加者ピッカーの選択候補（全クラス・全学生）を読み込む。 */
  loadCandidates(): Promise<GatheringMemberCandidates>;
  /** 集合 1 件に登録済みの参加者の user_id を読み込む。 */
  loadMembers(gatheringId: number): Promise<number[]>;
  /** 集合 1 件の参加者を選択内容で置き換え、保存後の参加者の user_id を返す。 */
  saveMembers(
    gatheringId: number,
    userIds: readonly number[]
  ): Promise<number[]>;
}
