import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  type DocumentScrollLockMode,
  useDocumentScrollLock,
} from "./useDocumentScrollLock";

function ScrollLock({
  isLocked,
  mode,
}: {
  isLocked: boolean;
  mode?: DocumentScrollLockMode;
}) {
  useDocumentScrollLock(isLocked, { mode });
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
    document.body.style.setProperty(
      "overscroll-behavior",
      "contain",
      "important"
    );
    document.documentElement.style.setProperty(
      "overflow",
      "scroll",
      "important"
    );
    document.documentElement.style.setProperty(
      "overscroll-behavior",
      "none",
      "important"
    );

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
    expect(document.body.style.getPropertyPriority("overscroll-behavior")).toBe(
      "important"
    );
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
    expect(
      document.documentElement.style.getPropertyPriority("overscroll-behavior")
    ).toBe("important");

    unmount();
  });

  it("body modeはbody overflowだけを変更し、他のinline styleを保持して復元する", () => {
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty(
      "overscroll-behavior",
      "contain",
      "important"
    );
    document.documentElement.style.setProperty(
      "overflow",
      "scroll",
      "important"
    );
    document.documentElement.style.setProperty(
      "overscroll-behavior",
      "contain",
      "important"
    );

    const { unmount } = render(<ScrollLock isLocked mode="body" />);

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.body.style.getPropertyPriority("overscroll-behavior")).toBe(
      "important"
    );
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.documentElement.style.overscrollBehavior).toBe("contain");
    expect(
      document.documentElement.style.getPropertyPriority("overscroll-behavior")
    ).toBe("important");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.body.style.getPropertyPriority("overscroll-behavior")).toBe(
      "important"
    );
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.documentElement.style.overscrollBehavior).toBe("contain");
    expect(
      document.documentElement.style.getPropertyPriority("overscroll-behavior")
    ).toBe("important");
  });

  it("複数のbody mode ownerは最後の解除までbody overflowを維持する", () => {
    document.body.style.setProperty("overflow", "auto");
    document.body.style.setProperty("overscroll-behavior", "contain");
    document.documentElement.style.setProperty("overflow", "scroll");
    document.documentElement.style.setProperty("overscroll-behavior", "none");

    const { rerender } = render(
      <>
        <ScrollLock isLocked mode="body" />
        <ScrollLock isLocked mode="body" />
      </>
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");

    rerender(
      <>
        <ScrollLock isLocked={false} mode="body" />
        <ScrollLock isLocked mode="body" />
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <>
        <ScrollLock isLocked={false} mode="body" />
        <ScrollLock isLocked={false} mode="body" />
      </>
    );
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
  });

  it("body modeの後にdocument modeを取得・解除してもbody modeへ戻す", () => {
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("overscroll-behavior", "contain");
    document.documentElement.style.setProperty("overflow", "scroll");
    document.documentElement.style.setProperty("overscroll-behavior", "auto");

    const { rerender } = render(<ScrollLock isLocked mode="body" />);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");

    rerender(
      <>
        <ScrollLock isLocked mode="body" />
        <ScrollLock isLocked />
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");

    rerender(
      <>
        <ScrollLock isLocked mode="body" />
        <ScrollLock isLocked={false} />
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("auto");

    rerender(
      <>
        <ScrollLock isLocked={false} mode="body" />
        <ScrollLock isLocked={false} />
      </>
    );
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
  });

  it("document modeの後にbody modeを取得・解除しても同じeffective modeを保つ", () => {
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("overscroll-behavior", "contain");
    document.documentElement.style.setProperty("overflow", "scroll");
    document.documentElement.style.setProperty("overscroll-behavior", "auto");

    const { rerender } = render(<ScrollLock isLocked />);
    expect(document.body.style.overscrollBehavior).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(
      <>
        <ScrollLock isLocked />
        <ScrollLock isLocked mode="body" />
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(
      <>
        <ScrollLock isLocked={false} />
        <ScrollLock isLocked mode="body" />
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("auto");

    rerender(
      <>
        <ScrollLock isLocked={false} />
        <ScrollLock isLocked={false} mode="body" />
      </>
    );
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.getPropertyPriority("overflow")).toBe(
      "important"
    );
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
  });
});
