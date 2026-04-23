import { useEffect, useRef, useState } from "react";

type SearchShortcutLabel = "Ctrl + K" | "ESC";

const SEARCH_SHORTCUT_FALLBACK_WIDTH_PX = 56;

type UseSearchShortcutWidthsParams = {
  isOpen: boolean;
};

export function useSearchShortcutWidths({
  isOpen,
}: UseSearchShortcutWidthsParams) {
  const [shortcutWidths, setShortcutWidths] = useState<
    Record<SearchShortcutLabel, number>
  >({
    "Ctrl + K": SEARCH_SHORTCUT_FALLBACK_WIDTH_PX,
    ESC: SEARCH_SHORTCUT_FALLBACK_WIDTH_PX,
  });
  const ctrlShortcutRef = useRef<HTMLSpanElement>(null);
  const escShortcutRef = useRef<HTMLSpanElement>(null);
  const currentShortcutLabel: SearchShortcutLabel = isOpen ? "ESC" : "Ctrl + K";

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const ctrlWidth = ctrlShortcutRef.current?.getBoundingClientRect().width;
      const escWidth = escShortcutRef.current?.getBoundingClientRect().width;

      if (!ctrlWidth || !escWidth) {
        return;
      }

      setShortcutWidths((currentWidths) => {
        if (
          currentWidths["Ctrl + K"] === ctrlWidth &&
          currentWidths.ESC === escWidth
        ) {
          return currentWidths;
        }

        return {
          "Ctrl + K": ctrlWidth,
          ESC: escWidth,
        };
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return {
    ctrlShortcutRef,
    currentShortcutLabel,
    currentShortcutWidth: shortcutWidths[currentShortcutLabel],
    escShortcutRef,
  };
}
