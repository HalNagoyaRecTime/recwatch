import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormModal } from "./FormModal";

describe("FormModal", () => {
  it("閉じるanimationが完了してunmountするまでscroll lockを保ち、元のstyleを復元する", () => {
    const documentElement = document.documentElement;
    const originalDocumentOverflow = {
      value: documentElement.style.getPropertyValue("overflow"),
      priority: documentElement.style.getPropertyPriority("overflow"),
    };
    const originalBodyOverflow = {
      value: document.body.style.getPropertyValue("overflow"),
      priority: document.body.style.getPropertyPriority("overflow"),
    };
    const matchMediaDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "matchMedia"
    );
    const onClose = vi.fn();
    let removeModal = () => {};

    documentElement.style.setProperty("overflow", "scroll", "important");
    document.body.style.setProperty("overflow", "auto", "important");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false }),
    });
    vi.useFakeTimers();

    try {
      const rendered = render(
        <FormModal onClose={onClose} title="登録">
          <button type="button">保存</button>
        </FormModal>
      );
      removeModal = rendered.unmount;

      expect(documentElement.style.overflow).toBe("hidden");
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
      act(() => vi.advanceTimersByTime(179));

      expect(onClose).not.toHaveBeenCalled();
      expect(documentElement.style.overflow).toBe("hidden");
      expect(document.body.style.overflow).toBe("hidden");

      act(() => vi.advanceTimersByTime(1));

      expect(onClose).toHaveBeenCalledOnce();
      expect(documentElement.style.overflow).toBe("hidden");
      expect(document.body.style.overflow).toBe("hidden");

      removeModal();

      expect(documentElement.style.overflow).toBe("scroll");
      expect(documentElement.style.getPropertyPriority("overflow")).toBe(
        "important"
      );
      expect(document.body.style.overflow).toBe("auto");
      expect(document.body.style.getPropertyPriority("overflow")).toBe(
        "important"
      );
    } finally {
      removeModal();
      vi.useRealTimers();

      if (matchMediaDescriptor) {
        Object.defineProperty(window, "matchMedia", matchMediaDescriptor);
      } else {
        Reflect.deleteProperty(window, "matchMedia");
      }

      if (originalDocumentOverflow.value) {
        documentElement.style.setProperty(
          "overflow",
          originalDocumentOverflow.value,
          originalDocumentOverflow.priority
        );
      } else {
        documentElement.style.removeProperty("overflow");
      }
      if (originalBodyOverflow.value) {
        document.body.style.setProperty(
          "overflow",
          originalBodyOverflow.value,
          originalBodyOverflow.priority
        );
      } else {
        document.body.style.removeProperty("overflow");
      }
    }
  });

  it("フォーカスをモーダル内に閉じ込める", async () => {
    const user = userEvent.setup();

    render(
      <FormModal description="説明" onClose={vi.fn()} title="登録">
        <input aria-label="名前" />
        <button type="button">保存</button>
      </FormModal>
    );

    const closeButton = screen.getByRole("button", { name: "閉じる" });
    const input = screen.getByLabelText("名前");
    const saveButton = screen.getByRole("button", { name: "保存" });

    await waitFor(() => expect(closeButton).toHaveFocus());
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab();
    expect(saveButton).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(saveButton).toHaveFocus();
  });
});
