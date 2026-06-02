import type { RefObject } from "react";
import { useCallback } from "react";

type UseSearchBarActivationParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  onOpen: () => void;
};

export function useSearchBarActivation({
  inputRef,
  onOpen,
}: UseSearchBarActivationParams) {
  const handleActivate = useCallback(() => {
    onOpen();

    window.requestAnimationFrame(() => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }, [inputRef, onOpen]);

  return {
    handleActivate,
  };
}
