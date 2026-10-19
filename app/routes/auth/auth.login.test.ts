import { afterEach, describe, expect, it } from "vitest";

import { clientLoader } from "./auth.login";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("/login route", () => {
  it("削除認証のpendingをログイン画面表示前に破棄する", () => {
    window.sessionStorage.setItem("rectime_deletion_auth_pending", "1");

    clientLoader();

    expect(
      window.sessionStorage.getItem("rectime_deletion_auth_pending")
    ).toBeNull();
  });
});
