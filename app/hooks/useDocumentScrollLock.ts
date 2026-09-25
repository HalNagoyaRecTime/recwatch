import { useEffect } from "react";

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

let activeLocks = 0;
let originalStyles: DocumentScrollStyles | null = null;

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

function acquireDocumentScrollLock() {
  if (typeof document === "undefined") return () => {};

  const { body, documentElement } = document;
  if (activeLocks === 0) {
    originalStyles = {
      bodyOverflow: readInlineStyle(body, "overflow"),
      bodyOverscrollBehavior: readInlineStyle(body, "overscroll-behavior"),
      documentOverflow: readInlineStyle(documentElement, "overflow"),
      documentOverscrollBehavior: readInlineStyle(
        documentElement,
        "overscroll-behavior"
      ),
    };

    body.style.setProperty("overflow", "hidden");
    body.style.setProperty("overscroll-behavior", "none");
    documentElement.style.setProperty("overflow", "hidden");
    documentElement.style.setProperty("overscroll-behavior", "none");
  }
  activeLocks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLocks -= 1;

    if (activeLocks > 0 || !originalStyles) return;

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
  };
}

export function useDocumentScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    return acquireDocumentScrollLock();
  }, [isLocked]);
}
