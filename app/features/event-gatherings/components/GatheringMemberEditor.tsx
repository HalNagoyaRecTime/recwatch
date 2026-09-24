import { useEffect } from "react";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import { useGatheringMembers } from "~/features/event-gatherings/hooks/useGatheringMembers";
import type { GatheringMemberCandidates } from "~/features/event-gatherings/model/gathering-member-candidate";
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
  const { setSelectedUserIds } = members;

  // 候補は学生から作るため、学生でない参加者には行が無く、チェックを外せない。
  // 管理画面から staff にできるのは学生だけで、学生でない参加者は画面操作では
  // 作れないため、保持せず選択から落として保存時に外れるようにする。
  useEffect(() => {
    if (!candidates) return;
    const selectableUserIds = new Set(
      candidates.students.map((student) => student.userId)
    );
    setSelectedUserIds((current) => {
      const selectable = current.filter((userId) =>
        selectableUserIds.has(userId)
      );
      return selectable.length === current.length ? current : selectable;
    });
  }, [candidates, setSelectedUserIds]);

  async function handleSave() {
    const saved = await members.save();
    if (saved) onSaved(saved);
  }

  return (
    <GatheringMemberPicker
      candidates={candidates}
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
