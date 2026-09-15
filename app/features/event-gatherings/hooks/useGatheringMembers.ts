import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";

type UseGatheringMembersOptions = {
  gatheringId: number;
  gateway: GatheringMemberGateway;
};

const LOAD_ERROR_MESSAGE = "登録済みの参加者の取得に失敗しました。";
const SAVE_ERROR_MESSAGE = "参加者の保存に失敗しました。";

/**
 * 集合 1 件の参加者を読み込み、選択中の状態と保存を扱う。
 * 参加者ピッカーを開いた集合の分だけ読み込み、保存は選択内容全体を 1 回で送る。
 * 保存に失敗しても選択はそのまま残し、修正して再試行できるようにする。
 */
export function useGatheringMembers({
  gatheringId,
  gateway,
}: UseGatheringMembersOptions) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(async () => {
      if (!isCurrent) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const userIds = await gateway.loadMembers(gatheringId);
        if (isCurrent) setSelectedUserIds(userIds);
      } catch (error) {
        if (isCurrent) setLoadError(getErrorMessage(error, LOAD_ERROR_MESSAGE));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [gatheringId, gateway]);

  const save = useCallback(async (): Promise<number[] | null> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await gateway.saveMembers(gatheringId, selectedUserIds);
      setSelectedUserIds(saved);
      return saved;
    } catch (error) {
      setSaveError(getErrorMessage(error, SAVE_ERROR_MESSAGE));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [gatheringId, gateway, selectedUserIds]);

  return {
    selectedUserIds,
    setSelectedUserIds,
    isLoading,
    loadError,
    isSaving,
    saveError,
    save,
  };
}
