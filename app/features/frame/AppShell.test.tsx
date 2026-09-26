import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/features/frame/sidebar/SidebarShell", () => ({
  SidebarShell: () => <aside data-testid="sidebar-shell" />,
}));
vi.mock("~/features/frame/main-header/MainShell", () => ({
  MainShell: () => <main data-testid="main-shell" />,
}));
vi.mock("~/components/providers/SidebarStateProvider", () => ({
  SidebarStateProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("~/features/frame/feedback/components/FeedbackProvider", () => ({
  FeedbackProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("~/features/frame/feedback/components/FeedbackToastHost", () => ({
  FeedbackToastHost: () => null,
}));

import { AppShell } from "~/features/frame/AppShell";

afterEach(() => {
  cleanup();
});

describe("AppShell", () => {
  it("DocumentScrollbarをアプリFrameだけにmountし、unmount時にmarkerを戻す", () => {
    const { container, unmount } = render(<AppShell />);

    const appFrame = container.querySelector(".viewport-min-height");
    const children = Array.from(appFrame?.children ?? []);

    expect(children[0]).toHaveAttribute("data-testid", "sidebar-shell");
    expect(children[1]).toHaveAttribute("data-testid", "main-shell");
    expect(screen.getByTestId("document-scrollbar")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute(
      "data-document-scrollbar",
      "active"
    );

    unmount();
    expect(document.documentElement).not.toHaveAttribute(
      "data-document-scrollbar"
    );
  });
});
