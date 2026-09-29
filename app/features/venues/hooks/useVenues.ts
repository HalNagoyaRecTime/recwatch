import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "~/lib/client-error";

import type {
  VenueGateway,
  VenueListOptions,
  VenuePage,
} from "~/features/venues/api/contracts/venue-gateway";
import type { Venue } from "~/features/venues/model/venue";

type UseVenuesOptions = {
  gateway: VenueGateway;
  listOptions?: VenueListOptions;
};

export function useVenues({ gateway, listOptions }: UseVenuesOptions) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const reload = useCallback(async (): Promise<VenuePage | null> => {
    const nextRequestVersion = requestVersion.current + 1;
    requestVersion.current = nextRequestVersion;
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPage = await gateway.list(listOptions);
      if (nextRequestVersion !== requestVersion.current) return null;

      setVenues(nextPage.items);
      setTotal(nextPage.total);
      return nextPage;
    } catch (error) {
      if (nextRequestVersion !== requestVersion.current) return null;

      setLoadError(getErrorMessage(error, "実施場所の取得に失敗しました。"));
      return null;
    } finally {
      if (nextRequestVersion === requestVersion.current) setIsLoading(false);
    }
  }, [gateway, listOptions]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void reload();
    });

    return () => {
      active = false;
      requestVersion.current += 1;
    };
  }, [reload]);

  const createVenue = useCallback(
    async (name: string) => {
      return gateway.create(name);
    },
    [gateway]
  );

  const updateVenue = useCallback(
    async (id: number, name: string) => {
      return gateway.update(id, name);
    },
    [gateway]
  );

  const deleteVenue = useCallback(
    async (id: number) => {
      await gateway.delete(id);
    },
    [gateway]
  );

  return {
    venues,
    total,
    isLoading,
    loadError,
    createVenue,
    updateVenue,
    deleteVenue,
    reload,
  };
}
