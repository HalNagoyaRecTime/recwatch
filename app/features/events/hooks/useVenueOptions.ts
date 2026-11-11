import { useEffect, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";
import type { VenueOption, VenueReader } from "~/features/venues/public";

export function useVenueOptions(reader: VenueReader) {
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    reader
      .listAll()
      .then((loaded) => {
        if (isCurrent) setVenues(loaded);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(
          getErrorMessage(error, "実施場所の一覧を取得できませんでした。")
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reader]);

  return { venues, isLoading, loadError };
}
