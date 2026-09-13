import { useCallback, useRef, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import type { GatheringMemberCandidates } from "~/features/event-gatherings/model/gathering-member-candidate";

type UseGatheringMemberCandidatesOptions = {
  gateway: GatheringMemberGateway;
};

const LOAD_ERROR_MESSAGE = "参加者候補の取得に失敗しました。";

/**
 * 参加者ピッカーの選択候補を、最初に必要になった時点で 1 度だけ読み込む。
 * 学生数が多いため、集合設定を開いただけでは取得しない。
 */
export function useGatheringMemberCandidates({
  gateway,
}: UseGatheringMemberCandidatesOptions) {
  const [candidates, setCandidates] =
    useState<GatheringMemberCandidates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pending = useRef<Promise<void> | null>(null);

  const ensureLoaded = useCallback(() => {
    if (candidates || pending.current) return;

    setIsLoading(true);
    setLoadError(null);
    pending.current = gateway
      .loadCandidates()
      .then((loaded) => setCandidates(loaded))
      .catch((error: unknown) =>
        setLoadError(getErrorMessage(error, LOAD_ERROR_MESSAGE))
      )
      .finally(() => {
        pending.current = null;
        setIsLoading(false);
      });
  }, [candidates, gateway]);

  return { candidates, isLoading, loadError, ensureLoaded };
}
