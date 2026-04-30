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
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }

      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onOpen]);
}
