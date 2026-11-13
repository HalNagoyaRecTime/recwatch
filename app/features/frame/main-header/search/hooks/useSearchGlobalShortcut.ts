import { useEffect } from "react";

type UseSearchGlobalShortcutParams = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function useSearchGlobalShortcut({
  isOpen,
  onOpen,
  onClose,
}: UseSearchGlobalShortcutParams) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        !event.isComposing &&
        event.keyCode !== 229 &&
        !event.altKey &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        onOpen();
      }

      if (
        event.key === "Escape" &&
        isOpen &&
        !event.isComposing &&
        event.keyCode !== 229
      ) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onOpen]);
}
