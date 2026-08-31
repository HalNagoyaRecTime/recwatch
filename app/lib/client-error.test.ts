import { describe, expect, it } from "vitest";

import { ApiClientError } from "./api-client-error";
import { ClientError, ClientErrors, getErrorMessage } from "./client-error";

describe("getErrorMessage", () => {
  it("APIエラーのfieldErrorsとformErrorsを画面表示用メッセージへ含める", () => {
    const error = new ApiClientError(
      400,
      "入力内容を確認してください。",
      "INVALID_REQUEST",
      {
        fieldErrors: { title: ["タイトルは必須です"] },
        formErrors: ["配信対象を選択してください"],
      }
    );

    expect(getErrorMessage(error)).toBe(
      "入力内容を確認してください。 配信対象を選択してください title: タイトルは必須です"
    );
  });

  it("未知の例外は共通の予期しないエラーへフォールバックする", () => {
    expect(getErrorMessage(new Error("internal"))).toBe(
      ClientErrors.UNEXPECTED_ERROR.message
    );
  });

  it("未知の例外は指定されたfallbackMessageへフォールバックする", () => {
    expect(getErrorMessage(new Error("internal"), "保存に失敗しました")).toBe(
      "保存に失敗しました"
    );
  });

  it("クライアントエラーは定義済みメッセージを返す", () => {
    expect(getErrorMessage(new ClientError(ClientErrors.NETWORK_ERROR))).toBe(
      ClientErrors.NETWORK_ERROR.message
    );
  });
});
