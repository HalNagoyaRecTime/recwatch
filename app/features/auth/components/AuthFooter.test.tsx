import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { AuthFooter } from "~/features/auth/components/AuthFooter";

afterEach(cleanup);

describe("AuthFooter", () => {
  it("固定URLの利用規約とプライバシーポリシーへ案内する", async () => {
    const user = userEvent.setup();

    render(<AuthFooter />);

    const termsLink = screen.getByRole("link", { name: "利用規約" });
    const privacyLink = screen.getByRole("link", {
      name: "プライバシーポリシー",
    });

    expect(termsLink).toHaveAttribute("href", "/legal/terms.html");
    expect(privacyLink).toHaveAttribute("href", "/legal/privacy.html");

    await user.tab();
    expect(termsLink).toHaveFocus();
    await user.tab();
    expect(privacyLink).toHaveFocus();
  });
});
