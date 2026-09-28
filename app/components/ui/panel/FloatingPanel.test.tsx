import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingListSurface } from "./FloatingListSurface";
import { FloatingPanel } from "./FloatingPanel";

describe("FloatingPanel", () => {
  it("クリックで開いたパネルへTabで移動し、Escapeでトリガーへ戻る", async () => {
    const user = userEvent.setup();

    render(
      <FloatingPanel
        content={<button type="button">項目</button>}
        trigger={<button type="button">開く</button>}
      />
    );

    const trigger = screen.getByRole("button", { name: "開く" });
    await user.click(trigger);

    expect(trigger).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const panel = screen.getByRole("dialog");
    expect(panel).not.toHaveClass("w-max");
    expect(panel).not.toHaveClass("max-w-(--floating-panel-available-width)");

    await user.tab();
    expect(screen.getByRole("button", { name: "項目" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("最後の項目からTabでパネル外へ移動すると閉じる", async () => {
    const user = userEvent.setup();

    render(
      <>
        <FloatingPanel
          content={<button type="button">項目</button>}
          trigger={<button type="button">開く</button>}
        />
        <button type="button">背面のボタン</button>
      </>
    );

    await user.click(screen.getByRole("button", { name: "開く" }));
    await user.tab();
    expect(screen.getByRole("button", { name: "項目" })).toHaveFocus();

    await user.tab();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "背面のボタン" })).toHaveFocus();
  });

  it("パネルの利用可能サイズをsurfaceへ渡し、wrapperをscrollportにしない", async () => {
    const user = userEvent.setup();

    render(
      <FloatingPanel
        content={<div>内容</div>}
        trigger={<button type="button">開く</button>}
        scrollable
      />
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const panel = screen.getByRole("dialog");
    expect(panel).toHaveClass("app-rounded");
    expect(
      panel.style.getPropertyValue("--floating-panel-available-height")
    ).toMatch(/px$/);
    expect(
      panel.style.getPropertyValue("--floating-panel-available-width")
    ).toMatch(/px$/);
    expect(panel).not.toHaveStyle({ overflow: "auto" });
  });

  it.each([
    { description: "短い", label: "編集" },
    { description: "長い", label: "通知の詳細な操作項目".repeat(8) },
  ])(
    "scrollableな$description Menuは内容幅を使い利用可能幅で制限する",
    async ({ label }) => {
      const user = userEvent.setup();

      render(
        <FloatingPanel
          content={<Menu items={[{ id: "action", label, type: "action" }]} />}
          trigger={<button type="button">開く</button>}
          scrollable
        />
      );

      await user.click(screen.getByRole("button", { name: "開く" }));

      const panel = screen.getByRole("dialog");
      const surface = panel.firstElementChild;
      expect(panel).toHaveClass(
        "w-max",
        "max-w-(--floating-panel-available-width)"
      );
      expect(surface).toHaveClass(
        "max-h-[var(--floating-panel-available-height)]",
        "max-w-[var(--floating-panel-available-width)]"
      );
      expect(panel.querySelector(".scrollbar-none")).toHaveClass(
        "overflow-x-hidden",
        "overflow-y-auto"
      );
    }
  );

  it("Notification Centerのような明示幅を持つscrollable contentを維持する", async () => {
    const user = userEvent.setup();
    const explicitWidth = "w-[min(20rem,calc(100vw-1rem))]";

    render(
      <FloatingPanel
        content={
          <div className={explicitWidth}>
            <FloatingListSurface scrollable>通知</FloatingListSurface>
          </div>
        }
        trigger={<button type="button">開く</button>}
        scrollable
      />
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const panel = screen.getByRole("dialog");
    expect(panel).toHaveClass(
      "w-max",
      "max-w-(--floating-panel-available-width)"
    );
    expect(panel.firstElementChild).toHaveClass(explicitWidth);
    expect(panel.firstElementChild?.firstElementChild).toHaveClass(
      "max-h-[var(--floating-panel-available-height)]",
      "max-w-[var(--floating-panel-available-width)]"
    );
  });

  it("trigger独自のpointerイベントをFloating UIのpropsと合成する", async () => {
    const user = userEvent.setup();
    const onPointerDown = vi.fn();

    render(
      <FloatingPanel
        content={<div>内容</div>}
        interaction="both"
        trigger={
          <button onPointerDown={onPointerDown} type="button">
            開く
          </button>
        }
      />
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    expect(onPointerDown).toHaveBeenCalled();
  });
});
