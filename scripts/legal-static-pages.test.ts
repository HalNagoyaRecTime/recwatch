import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import legal from "./legal-pages.json";

const publicPath = (...segments: string[]) =>
  resolve(process.cwd(), "public", ...segments);

function readDocument(fileName: string) {
  const html = readFileSync(publicPath("legal", fileName), "utf8");
  const document = new DOMParser().parseFromString(html, "text/html");
  return { document, html };
}

describe("法務静的ページ", () => {
  it.each(legal.pages)(
    "$fileNameはJavaScriptなしで単独表示できる",
    ({ fileName, title, headingCount }) => {
      const { document, html } = readDocument(fileName);

      expect(document.documentElement.lang).toBe("ja");
      expect(document.title).toBe(title);
      expect(document.querySelectorAll("h1")).toHaveLength(1);
      expect(document.querySelector("h1")?.textContent?.trim()).toBe(title);
      expect(document.querySelectorAll("main h2")).toHaveLength(headingCount);
      expect(document.querySelector('meta[charset="UTF-8"]')).not.toBeNull();
      expect(document.querySelector('meta[name="viewport"]')).not.toBeNull();
      expect(document.querySelectorAll("script")).toHaveLength(0);
      expect(html).not.toMatch(/TODO|TBD|PLACEHOLDER|仮値|未確定|要確認/i);
    }
  );

  it("両文書に相互リンク、問い合わせ先、削除導線、制定日がある", () => {
    for (const page of legal.pages) {
      const { document } = readDocument(page.fileName);

      for (const otherPage of legal.pages.filter(
        (candidate) => candidate.path !== page.path
      )) {
        expect(
          document.querySelector(`a[href="${otherPage.path}"]`)
        ).not.toBeNull();
      }

      expect(
        document
          .querySelector(`a[href="${legal.accountDeletionPath}"]`)
          ?.textContent?.trim()
      ).toContain("アカウント削除申請");
      expect(
        document
          .querySelector(`a[href="mailto:${legal.contactEmail}"]`)
          ?.textContent?.trim()
      ).toBe(legal.contactEmail);
      expect(
        document
          .querySelector(`time[datetime="${legal.enactedAt.datetime}"]`)
          ?.textContent?.trim()
      ).toBe(legal.enactedAt.label);
      expect(document.body.textContent).toContain(legal.operator);
      expect(document.body.textContent).toContain(legal.representative);
      expect(document.body.textContent).toContain(legal.address);
    }
  });

  it("プライバシーポリシーに外部サービスの正式なリンクがある", () => {
    const privacyPage = legal.pages.find(({ fileName }) =>
      fileName.startsWith("privacy")
    );
    expect(privacyPage).toBeDefined();
    if (!privacyPage) return;

    const { document } = readDocument(privacyPage.fileName);
    for (const href of legal.externalPrivacyLinks) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it("Cloudflare Pagesで固定.html URLを200 proxyする", () => {
    const redirects = readFileSync(publicPath("_redirects"), "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    expect(redirects).toEqual(
      legal.pages.map(
        ({ path }) => `${path} ${path.replace(/\.html$/, "")} 200`
      )
    );
  });
});
