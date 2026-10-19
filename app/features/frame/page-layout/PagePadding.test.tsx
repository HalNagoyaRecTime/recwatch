import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";

const normalizedCss = readFileSync("app/app.css", "utf8").replace(/\s+/g, " ");

function getRule(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return normalizedCss.match(
    new RegExp(`${escapedSelector} \\{([^}]+)\\}`)
  )?.[1];
}

describe("PagePadding", () => {
  it("MobileではHeaderと本文の左右余白をsafe-area込みでそろえる", () => {
    render(<PagePadding>本文</PagePadding>);

    expect(screen.getByText("本文")).toHaveClass("page-padding", "py-6");

    const headerRule = getRule(".main-header-row");
    const pageRule = getRule(".page-padding");

    for (const side of ["left", "right"] as const) {
      const declaration = `padding-${side}: calc(0.75rem + env(safe-area-inset-${side}, 0px));`;
      expect(headerRule).toContain(declaration);
      expect(pageRule).toContain(declaration);
    }
  });

  it("md以上の本文左右余白は従来の2.5remを維持する", () => {
    const desktopRule = normalizedCss.match(
      /@media \(min-width: 48rem\) \{ \.page-padding \{([^}]+)\}/
    )?.[1];

    expect(desktopRule).toContain(
      "padding-right: calc(2.5rem + env(safe-area-inset-right, 0px));"
    );
    expect(desktopRule).toContain(
      "padding-left: calc(2.5rem + env(safe-area-inset-left, 0px));"
    );
  });
});
