import { useCallback, useEffect, useState } from "react";

import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

type UseGatheringSpotsOptions = {
  gateway: GatheringSpotGateway;
};

export function useGatheringSpots({ gateway }: UseGatheringSpotsOptions) {
  const [spots, setSpots] = useState<GatheringSpot[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const nextPage = await gateway.list();
        if (!isCurrent) return;

        setSpots(nextPage.items);
        setTotal(nextPage.total);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "集合場所の取得に失敗しました。"
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isCurrent = false;
    };
  }, [gateway]);

  const createSpot = useCallback(
    async (name: string) => {
      const created = await gateway.create(name);
      setSpots((current) => [...current, created]);
      setTotal((current) => current + 1);
      return created;
    },
    [gateway]
  );

  const updateSpot = useCallback(
    async (id: number, name: string) => {
      const updated = await gateway.update(id, name);
      setSpots((current) =>
        current.map((spot) => (spot.id === updated.id ? updated : spot))
      );
      return updated;
    },
    [gateway]
  );

  const deleteSpot = useCallback(
    async (id: number) => {
      await gateway.delete(id);
      setSpots((current) => current.filter((spot) => spot.id !== id));
      setTotal((current) => Math.max(0, current - 1));
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
  };
}
