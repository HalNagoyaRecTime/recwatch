import { useEffect } from "react";

export type DocumentScrollLockMode = "document" | "body";

type InlineStyleValue = {
  value: string;
  priority: string;
};

type DocumentScrollStyles = {
  bodyOverflow: InlineStyleValue;
  bodyOverscrollBehavior: InlineStyleValue;
  documentOverflow: InlineStyleValue;
  documentOverscrollBehavior: InlineStyleValue;
};

let bodyOnlyLocks = 0;
let documentLocks = 0;
let originalStyles: DocumentScrollStyles | null = null;
let appliedMode: DocumentScrollLockMode | null = null;

function readInlineStyle(
  element: HTMLElement,
  property: string
): InlineStyleValue {
  return {
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  };
}

function restoreInlineStyle(
  element: HTMLElement,
  property: string,
  previous: InlineStyleValue
) {
  if (previous.value) {
    element.style.setProperty(property, previous.value, previous.priority);
  } else {
    element.style.removeProperty(property);
  }
}

function restoreOriginalStyles() {
  if (!originalStyles) return;

  const { body, documentElement } = document;
  restoreInlineStyle(body, "overflow", originalStyles.bodyOverflow);
  restoreInlineStyle(
    body,
    "overscroll-behavior",
    originalStyles.bodyOverscrollBehavior
  );
  restoreInlineStyle(
    documentElement,
    "overflow",
    originalStyles.documentOverflow
  );
  restoreInlineStyle(
    documentElement,
    "overscroll-behavior",
    originalStyles.documentOverscrollBehavior
  );
  originalStyles = null;
  appliedMode = null;
}

function captureOriginalStyles() {
  const { body, documentElement } = document;
  originalStyles = {
    bodyOverflow: readInlineStyle(body, "overflow"),
    bodyOverscrollBehavior: readInlineStyle(body, "overscroll-behavior"),
    documentOverflow: readInlineStyle(documentElement, "overflow"),
    documentOverscrollBehavior: readInlineStyle(
      documentElement,
      "overscroll-behavior"
    ),
  };
}

function applyEffectiveLockMode() {
  if (!originalStyles) return;

  const nextMode =
    documentLocks > 0 ? "document" : bodyOnlyLocks > 0 ? "body" : null;
  if (nextMode === appliedMode) return;

  const { body, documentElement } = document;
  if (nextMode === "document") {
    body.style.setProperty("overflow", "hidden");
    body.style.setProperty("overscroll-behavior", "none");
    documentElement.style.setProperty("overflow", "hidden");
    documentElement.style.setProperty("overscroll-behavior", "none");
  } else if (nextMode === "body") {
    body.style.setProperty("overflow", "hidden");

    if (appliedMode === "document") {
      restoreInlineStyle(
        body,
        "overscroll-behavior",
        originalStyles.bodyOverscrollBehavior
      );
      restoreInlineStyle(
        documentElement,
        "overflow",
        originalStyles.documentOverflow
      );
      restoreInlineStyle(
        documentElement,
        "overscroll-behavior",
        originalStyles.documentOverscrollBehavior
      );
    }
  } else {
    restoreOriginalStyles();
    return;
  }

  appliedMode = nextMode;
}

function acquireDocumentScrollLock(mode: DocumentScrollLockMode) {
  if (typeof document === "undefined") return () => {};

  if (!originalStyles) {
    captureOriginalStyles();
  }

  if (mode === "document") documentLocks += 1;
  else bodyOnlyLocks += 1;
  applyEffectiveLockMode();

  let released = false;
  return () => {
    if (released) return;
    released = true;

    if (mode === "document") documentLocks -= 1;
    else bodyOnlyLocks -= 1;
    applyEffectiveLockMode();
  };
}

export function useDocumentScrollLock(
  isLocked: boolean,
  options: { mode?: DocumentScrollLockMode } = {}
) {
  const mode = options.mode ?? "document";

  useEffect(() => {
    if (!isLocked) return;
    return acquireDocumentScrollLock(mode);
  }, [isLocked, mode]);
}
