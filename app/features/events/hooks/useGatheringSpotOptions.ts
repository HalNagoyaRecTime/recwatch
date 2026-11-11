import { useEffect, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";
import type {
  GatheringSpotOption,
  GatheringSpotReader,
} from "~/features/gathering-spots/public";

export function useGatheringSpotOptions(reader: GatheringSpotReader) {
  const [spots, setSpots] = useState<GatheringSpotOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    reader
      .listAll()
      .then((loaded) => {
        if (isCurrent) setSpots(loaded);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(getErrorMessage(error, "集合場所の取得に失敗しました。"));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reader]);

  return { spots, isLoading, loadError };
}
