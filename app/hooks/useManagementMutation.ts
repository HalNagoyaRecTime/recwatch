import { useCallback, useRef, useState } from "react";

import { getErrorMessage } from "~/lib/client-error";
import {
  isUpdateConflictError,
  UPDATE_CONFLICT_MESSAGE,
} from "~/lib/update-conflict";

export type ManagementMutationOperation = () => Promise<unknown>;

export type ManagementMutationOptions = {
  onRevalidate?: () => Promise<void> | void;
};

/**
 * Management pages share the same asynchronous mutation lifecycle.  Feature
 * hooks should only describe the operation and its fallback message.
 */
export function useManagementMutation({
  onRevalidate,
}: ManagementMutationOptions = {}) {
  const mutationLock = useRef(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      operation: ManagementMutationOperation,
      fallbackMessage: string,
      shouldRevalidate = false,
      onConflict?: () => Promise<void> | void
    ): Promise<boolean> => {
      if (mutationLock.current) return false;

      mutationLock.current = true;
      setIsMutating(true);
      setError(null);

      try {
        await operation();
        if (shouldRevalidate) await onRevalidate?.();
        return true;
      } catch (reason) {
        if (onConflict && isUpdateConflictError(reason)) {
          setError(UPDATE_CONFLICT_MESSAGE);
          await onConflict();
        } else {
          setError(getErrorMessage(reason, fallbackMessage));
        }
        return false;
      } finally {
        mutationLock.current = false;
        setIsMutating(false);
      }
    },
    [onRevalidate]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    clearError,
    error,
    isMutating,
    run,
  };
}
