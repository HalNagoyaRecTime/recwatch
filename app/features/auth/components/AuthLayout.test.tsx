import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AuthLayout } from "~/features/auth/components/AuthLayout";

afterEach(() => {
  cleanup();
  document.querySelector('meta[name="viewport"]')?.remove();
  document.body.removeAttribute("data-auth-safe-area");
});

describe("AuthLayout", () => {
  it("viewport metaとbody属性を動的に変更しない", () => {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    document.head.append(viewport);

    render(
      <AuthLayout>
        <p>ログインフォーム</p>
      </AuthLayout>
    );

    expect(viewport.content).toBe("width=device-width, initial-scale=1");
    expect(document.body).not.toHaveAttribute("data-auth-safe-area");
    expect(screen.getByRole("main")).not.toHaveClass("auth-safe-viewport");
  });
});
