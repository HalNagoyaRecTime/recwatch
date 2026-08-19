import { useCallback, useEffect, useRef, useState } from "react";

import type {
  GatheringSpotGateway,
  GatheringSpotPage,
  GatheringSpotListOptions,
} from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

type UseGatheringSpotsOptions = {
  gateway: GatheringSpotGateway;
  listOptions?: GatheringSpotListOptions;
};

export function useGatheringSpots({
  gateway,
  listOptions,
}: UseGatheringSpotsOptions) {
  const [spots, setSpots] = useState<GatheringSpot[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const reload = useCallback(async (): Promise<GatheringSpotPage | null> => {
    const nextRequestVersion = requestVersion.current + 1;
    requestVersion.current = nextRequestVersion;
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPage = await gateway.list(listOptions);
      if (nextRequestVersion !== requestVersion.current) return null;

      setSpots(nextPage.items);
      setTotal(nextPage.total);
      return nextPage;
    } catch (error) {
      if (nextRequestVersion !== requestVersion.current) return null;

      setLoadError(
        error instanceof Error
          ? error.message
          : "集合場所の取得に失敗しました。"
      );
      return null;
    } finally {
      if (nextRequestVersion === requestVersion.current) setIsLoading(false);
    }
  }, [gateway, listOptions]);

  useEffect(() => {
    void reload();
    return () => {
      requestVersion.current += 1;
    };
  }, [reload]);

  const createSpot = useCallback(
    async (name: string) => {
      return gateway.create(name);
    },
    [gateway]
  );

  const updateSpot = useCallback(
    async (id: number, name: string) => {
      return gateway.update(id, name);
    },
    [gateway]
  );

  const deleteSpot = useCallback(
    async (id: number) => {
      await gateway.delete(id);
    },
    [gateway]
  );

  return {
    spots,
    total,
    isLoading,
    loadError,
    createSpot,
    updateSpot,
    deleteSpot,
    reload,
  };
}
