import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { Scrollbar } from "~/components/ui/scrollbar/Scrollbar";
import { createDocumentScrollbarTarget } from "~/components/ui/scrollbar/scrollbar-target";
import { useScrollbar } from "~/components/ui/scrollbar/useScrollbar";

/** AppShell内のdocument scrollを共通Scrollbarで操作します。 */
export function DocumentScrollbar() {
  const target = useMemo(() => createDocumentScrollbarTarget(), []);
  const scrollbar = useScrollbar({ orientation: "vertical", target });
  const { verticalTrackRef, vertical, isVisible, onMouseEnter, onMouseLeave } =
    scrollbar;
  const isNearEdgeRef = useRef(false);

  useEffect(() => {
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const isNearEdge = event.clientX >= window.innerWidth - 16;
      if (isNearEdge === isNearEdgeRef.current) return;
      isNearEdgeRef.current = isNearEdge;
      if (isNearEdge) onMouseEnter();
      else onMouseLeave();
    };
    const handleWindowLeave = () => {
      if (!isNearEdgeRef.current) return;
      isNearEdgeRef.current = false;
      onMouseLeave();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("blur", handleWindowLeave);
    window.addEventListener("pointerleave", handleWindowLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handleWindowLeave);
      window.removeEventListener("pointerleave", handleWindowLeave);
    };
  }, [onMouseEnter, onMouseLeave]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousValue = root.getAttribute("data-document-scrollbar");
    root.setAttribute("data-document-scrollbar", "active");

    return () => {
      if (previousValue === null) {
        root.removeAttribute("data-document-scrollbar");
      } else {
        root.setAttribute("data-document-scrollbar", previousValue);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="document-scrollbar"
      className="document-scrollbar pointer-events-none fixed inset-y-0 right-0 z-50 w-3"
    >
      <Scrollbar
        orientation="vertical"
        axis={vertical}
        trackRef={verticalTrackRef}
        isVisible={isVisible}
      />
    </div>
  );
}
