import { useEffect, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";

export type ManagementOptionState<T> = {
  error: string | null;
  isLoading: boolean;
  items: readonly T[];
};

export function useManagementOptions<T>(
  load: () => Promise<readonly T[]>,
  fallbackMessage: string
): ManagementOptionState<T> {
  const [state, setState] = useState<ManagementOptionState<T>>({
    error: null,
    isLoading: true,
    items: [],
  });

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      await Promise.resolve();
      if (!active) return;

      setState({ error: null, isLoading: true, items: [] });
      try {
        const items = await load();
        if (!active) return;
        setState({ error: null, isLoading: false, items });
      } catch (reason: unknown) {
        if (!active) return;
        setState({
          error: getErrorMessage(reason, fallbackMessage),
          isLoading: false,
          items: [],
        });
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, [fallbackMessage, load]);

  return state;
}
