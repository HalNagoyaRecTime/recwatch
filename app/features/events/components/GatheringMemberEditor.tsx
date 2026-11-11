import type { GatheringMemberGateway } from "~/features/events/api/contracts/gathering-member-gateway";
import { useGatheringMembers } from "~/features/events/hooks/useGatheringMembers";
import type { GatheringMemberCandidates } from "~/features/events/model/gathering-member-candidate";
import { GatheringMemberPicker } from "./GatheringMemberPicker";

type GatheringMemberEditorProps = {
  candidates: GatheringMemberCandidates | null;
  candidatesError: string | null;
  gatheringId: number;
  gateway: GatheringMemberGateway;
  isCandidatesLoading: boolean;
  onCancel: () => void;
  /** 保存に成功したときに、保存後の参加者の user_id を渡す。 */
  onSaved: (userIds: number[]) => void;
};

/**
 * 保存済みの集合 1 件について、登録済みの参加者を読み込んで編集・保存する。
 * 開いている集合の分だけ読み込むため、集合ごとにこのコンポーネントを付け替える。
 * 選択候補は全集合で共通のため呼び出し元から受け取る。
 */
export function GatheringMemberEditor({
  candidates,
  candidatesError,
  gatheringId,
  gateway,
  isCandidatesLoading,
  onCancel,
  onSaved,
}: GatheringMemberEditorProps) {
  const members = useGatheringMembers({ gatheringId, gateway });

  async function handleSave() {
    const saved = await members.save();
    if (saved) onSaved(saved);
  }

  return (
    <GatheringMemberPicker
      candidates={candidates}
      initialUserIds={members.initialUserIds}
      isLoading={isCandidatesLoading || members.isLoading}
      isSaving={members.isSaving}
      loadError={candidatesError ?? members.loadError}
      onCancel={onCancel}
      onChange={members.setSelectedUserIds}
      onSave={() => void handleSave()}
      saveError={members.saveError}
      selectedUserIds={members.selectedUserIds}
    />
  );
}
