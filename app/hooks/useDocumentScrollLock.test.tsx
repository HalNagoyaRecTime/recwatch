import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useDocumentScrollLock } from "./useDocumentScrollLock";

function ScrollLock({ isLocked }: { isLocked: boolean }) {
  useDocumentScrollLock(isLocked);
  return null;
}

afterEach(() => {
  cleanup();
});

describe("useDocumentScrollLock", () => {
  beforeEach(() => {
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("overscroll-behavior");
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overscroll-behavior");
  });

  it("複数の利用者間でロックを共有し、最後の解除時に元の値を戻す", () => {
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("overscroll-behavior", "contain");
    document.documentElement.style.setProperty("overflow", "scroll");
    document.documentElement.style.setProperty("overscroll-behavior", "none");

    const { rerender, unmount } = render(
      <>
        <ScrollLock isLocked />
        <ScrollLock isLocked />
      </>
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");

    rerender(
      <>
        <ScrollLock isLocked={false} />
        <ScrollLock isLocked />
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <>
        <ScrollLock isLocked={false} />
        <ScrollLock isLocked={false} />
      </>
    );
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");

    unmount();
  });
});
