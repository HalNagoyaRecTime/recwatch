import { describe, expect, it } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";

describe("getManagementRouteErrorMessage", () => {
  it.each([
    [
      { status: 401, statusText: "Unauthorized", data: "no session" },
      "認証が必要です。再ログインしてください。",
    ],
    [
      { status: 404, statusText: "Not Found", data: "対象がありません" },
      "エラー404:対象がありません",
    ],
    [
      { status: 500, statusText: "Server Error", data: undefined },
      "エラー500:Server Error",
    ],
  ])("RouteErrorResponseを表示する", (error, expected) => {
    expect(getManagementRouteErrorMessage(error)).toBe(expected);
  });

  it("ApiClientErrorの401とその他を表示する", () => {
    expect(
      getManagementRouteErrorMessage(new ApiClientError(401, "expired"))
    ).toBe("認証が必要です。再ログインしてください。");
    expect(
      getManagementRouteErrorMessage(new ApiClientError(503, "API down"))
    ).toBe("エラー503:API down");
  });

  it("standard Errorとunknown valueは共通fallbackを返す", () => {
    expect(getManagementRouteErrorMessage(new Error("unexpected"))).toBe(
      "予期しないエラーが発生しました。"
    );
    expect(getManagementRouteErrorMessage(null)).toBe(
      "予期しないエラーが発生しました。"
    );
    expect(getManagementRouteErrorMessage("unknown")).toBe(
      "予期しないエラーが発生しました。"
    );
  });
});
