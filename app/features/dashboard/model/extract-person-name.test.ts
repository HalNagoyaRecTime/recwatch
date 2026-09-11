import { describe, expect, it } from "vitest";

import { extractPersonName } from "./extract-person-name";

describe("extractPersonName", () => {
  it("学籍番号と氏名がスペース区切りの場合、氏名だけを返す", () => {
    expect(extractPersonName("ABCD12A34567 山田太郎")).toBe("山田太郎");
  });

  it("スペースが無い場合はそのまま返す", () => {
    expect(extractPersonName("山田太郎")).toBe("山田太郎");
  });

  it("氏名部分に空白が含まれる場合はそのまま保持する", () => {
    expect(extractPersonName("ABCD12A34567 山田 太郎")).toBe("山田 太郎");
  });
});
