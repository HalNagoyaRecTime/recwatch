import { useEffect, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";
import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import type { CompetitionVenue } from "~/features/sports/model/competition-venue";

export function useCompetitionVenueOptions(api: CompetitionEditorApi) {
  const [venues, setVenues] = useState<CompetitionVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    api
      .listVenues()
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
  }, [api]);

  return { venues, isLoading, loadError };
}
