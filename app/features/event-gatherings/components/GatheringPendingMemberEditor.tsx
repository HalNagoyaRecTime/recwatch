import { useState } from "react";

import type { GatheringMemberCandidates } from "~/features/event-gatherings/model/gathering-member-candidate";
import { GatheringMemberPicker } from "./GatheringMemberPicker";

type GatheringPendingMemberEditorProps = {
  candidates: GatheringMemberCandidates | null;
  candidatesError: string | null;
  initialUserIds: readonly number[];
  isCandidatesLoading: boolean;
  onCancel: () => void;
  onConfirm: (userIds: number[]) => void;
};

/** 集合保存前の参加者選択を一時保持し、集合保存後にまとめて登録する。 */
export function GatheringPendingMemberEditor({
  candidates,
  candidatesError,
  initialUserIds,
  isCandidatesLoading,
  onCancel,
  onConfirm,
}: GatheringPendingMemberEditorProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([
    ...initialUserIds,
  ]);

  return (
    <GatheringMemberPicker
      candidates={candidates}
      initialUserIds={initialUserIds}
      isLoading={isCandidatesLoading}
      isSaving={false}
      loadError={candidatesError}
      onCancel={onCancel}
      onChange={setSelectedUserIds}
      onSave={() => onConfirm(selectedUserIds)}
      saveLabel="選択を確定"
      saveError={null}
      selectedUserIds={selectedUserIds}
    />
  );
}
