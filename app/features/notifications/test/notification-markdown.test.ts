import { describe, expect, it } from "vitest";

import {
  toNotificationMarkdown,
  toNotificationMarkdownInput,
} from "~/features/notifications/model/notification-markdown";
import {
  toNotificationCreateRequest,
  toNotificationPatchRequest,
} from "~/features/notifications/hooks/notification-request-mapping";
import { toNotificationDraft } from "~/features/notifications/hooks/notification-draft-mapping";
import { initialNotificationDraft } from "~/features/notifications/model/notification-draft";
import { adminNotificationDetailFixture } from "~/features/notifications/mock/notification-fixtures";

describe("通知本文の改行変換", () => {
  it.each([
    ["first\nsecond\n\nthird", "first  \nsecond\n\nthird"],
    ["first\r\nsecond", "first  \r\nsecond"],
    ["- item\n  continued\n- next", "- item  \n  continued\n- next"],
    ["> first\n> second", "> first  \n> second"],
    [
      "```md\nfirst\nsecond\n```\n\ntext\nnext",
      "```md\nfirst\nsecond\n```\n\ntext  \nnext",
    ],
    [
      "    first\n    second\n\ntext\nnext",
      "    first\n    second\n\ntext  \nnext",
    ],
    ["`first\nsecond`\nnext", "`first\nsecond`  \nnext"],
    [
      "| A | B |\n| --- | --- |\n| C | D |",
      "| A | B |\n| --- | --- |\n| C | D |",
    ],
    ["first  \nsecond\\\nthird", "first  \nsecond\\\nthird"],
  ])("文章の改行だけを変換し、構文を保持する: %s", (input, expected) => {
    expect(toNotificationMarkdown(input)).toBe(expected);
    expect(toNotificationMarkdown(expected)).toBe(expected);
  });

  it("編集時は改行用のスペースだけを除き、コードや明示したバックスラッシュを保持する", () => {
    const input = "first\nsecond\\\nthird\n\n```\ncode  \nnext\n```";
    expect(toNotificationMarkdownInput(toNotificationMarkdown(input))).toBe(
      input
    );
  });

  it("新規・編集の送信では変換し、入力状態は変更しない", () => {
    const draft = { ...initialNotificationDraft, detailBody: "first\nsecond" };
    expect(toNotificationCreateRequest(draft).content.detail.body).toBe(
      "first  \nsecond"
    );
    expect(
      toNotificationPatchRequest(adminNotificationDetailFixture, draft)?.content
        ?.detail?.body
    ).toBe("first  \nsecond");
    expect(draft.detailBody).toBe("first\nsecond");
  });

  it("保存済みの本文を編集用の通常改行へ戻す", () => {
    const notification = {
      ...adminNotificationDetailFixture,
      content: {
        ...adminNotificationDetailFixture.content,
        detail: { title: "詳細", body: "first  \nsecond" },
      },
    };
    expect(toNotificationDraft(notification).detailBody).toBe("first\nsecond");
  });
});
