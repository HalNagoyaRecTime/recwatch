import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";
import { MarkdownPreview } from "~/components/ui/markdown/MarkdownPreview";
import userEvent from "@testing-library/user-event";

afterEach(cleanup);

describe("Markdown本文", () => {
  it("普通の文章も同じ構文で単独改行を段落内にする", () => {
    const { container } = render(
      <MarkdownContent content={"first\nsecond\n\nthird"} />
    );
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(container.querySelector("br")).toBeNull();
  });
  it.each(["first  \nsecond", "first\\\nsecond"])(
    "強制改行を表示する",
    (content) => {
      const { container } = render(<MarkdownContent content={content} />);
      expect(container.querySelectorAll("br")).toHaveLength(1);
    }
  );
  it("字下げコードと表を表示する", () => {
    const { container } = render(
      <MarkdownContent
        content={"    code\n\n| A | B |\n| - | - |\n| 1 | 2 |"}
      />
    );
    expect(container.querySelector("pre code")?.textContent).toBe("code\n");
    expect(container.querySelectorAll("th")).toHaveLength(2);
  });
  it("HTMLを実行せず危険なリンク・画像を読み込まない", () => {
    const { container } = render(
      <MarkdownContent
        content={
          "<script>alert(1)</script>\n\n[x](javascript:alert)\n\n![画像](data:image/png;base64,abc)"
        }
      />
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBe("");
  });
  it("絶対HTTP(S)画像を読み込む", () => {
    render(
      <MarkdownContent content={"![競技](https://example.com/map.png)"} />
    );
    expect(screen.getByAltText("競技")).toHaveAttribute(
      "src",
      "https://example.com/map.png"
    );
  });
  it("プレビューを開くまで画像を読み込まない", async () => {
    render(
      <MarkdownPreview content={"![競技](https://example.com/map.png)"} />
    );
    expect(screen.queryByAltText("競技")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "本文のプレビュー" })
    );
    expect(screen.getByAltText("競技")).toBeInTheDocument();
  });
});
