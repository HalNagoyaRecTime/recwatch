import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const publicPath = (...segments: string[]) =>
  resolve(process.cwd(), "public", ...segments);

function readDocument(fileName: string) {
  const html = readFileSync(publicPath("legal", fileName), "utf8");
  const document = new DOMParser().parseFromString(html, "text/html");
  return { document, html };
}

describe("法務静的ページ", () => {
  it.each([
    ["terms.html", "RE:CREATION 利用規約", 11],
    ["privacy.html", "RE:CREATION プライバシーポリシー", 9],
  ])("%sはJavaScriptなしで単独表示できる", (fileName, title, h2Count) => {
    const { document, html } = readDocument(fileName);

    expect(document.documentElement.lang).toBe("ja");
    expect(document.title).toBe(title);
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector("h1")?.textContent?.trim()).toBe(title);
    expect(document.querySelectorAll("main h2")).toHaveLength(h2Count);
    expect(document.querySelector('meta[charset="UTF-8"]')).not.toBeNull();
    expect(document.querySelector('meta[name="viewport"]')).not.toBeNull();
    expect(document.querySelectorAll("script")).toHaveLength(0);
    expect(html).not.toMatch(/TODO|TBD|PLACEHOLDER|仮値|未確定|要確認/i);
  });

  it("両文書に相互リンク、問い合わせ先、削除導線、制定日がある", () => {
    const terms = readDocument("terms.html").document;
    const privacy = readDocument("privacy.html").document;

    expect(terms.querySelector('a[href="/legal/privacy.html"]')).not.toBeNull();
    expect(privacy.querySelector('a[href="/legal/terms.html"]')).not.toBeNull();

    for (const document of [terms, privacy]) {
      expect(
        document
          .querySelector('a[href="/account-deletion"]')
          ?.textContent?.trim()
      ).toContain("アカウント削除申請");
      expect(
        document
          .querySelector('a[href="mailto:takahashi.masa@nh.hal.ac.jp"]')
          ?.textContent?.trim()
      ).toBe("takahashi.masa@nh.hal.ac.jp");
      expect(
        document
          .querySelector('time[datetime="2026-10-08"]')
          ?.textContent?.trim()
      ).toBe("2026年10月8日");
      expect(document.body.textContent).toContain("HAL名古屋");
      expect(document.body.textContent).toContain("校長 荒井洋行");
      expect(document.body.textContent).toContain(
        "愛知県名古屋市中村区名駅4-27-1"
      );
    }
  });

  it("プライバシーポリシーに外部サービスの正式なリンクがある", () => {
    const { document } = readDocument("privacy.html");

    for (const href of [
      "https://privacy.microsoft.com/ja-jp/privacystatement",
      "https://policies.google.com/privacy?hl=ja",
      "https://www.cloudflare.com/ja-jp/privacypolicy/",
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it("Cloudflare Pagesで固定.html URLを200 proxyする", () => {
    const redirects = readFileSync(publicPath("_redirects"), "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    expect(redirects).toEqual([
      "/legal/terms.html /legal/terms 200",
      "/legal/privacy.html /legal/privacy 200",
    ]);
  });
});
