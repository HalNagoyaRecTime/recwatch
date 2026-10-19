import { useEffect } from "react";

type UseSearchBodyScrollLockParams = {
  isLocked: boolean;
};

export function useSearchBodyScrollLock({
  isLocked,
}: UseSearchBodyScrollLockParams) {
  useEffect(() => {
    if (!isLocked || typeof document === "undefined") {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    const previousDocumentOverflow = documentElement.style.overflow;
    const previousDocumentOverscrollBehavior =
      documentElement.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
      documentElement.style.overflow = previousDocumentOverflow;
      documentElement.style.overscrollBehavior =
        previousDocumentOverscrollBehavior;
    };
  }, [isLocked]);
}
