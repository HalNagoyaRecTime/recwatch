import { ApiClientError } from "./api-client-error";

export type ClientErrorDefinition = {
  readonly code: string;
  readonly message: string;
};

export const ClientErrors = {
  CONFIG_ERROR: {
    code: "CONFIG_ERROR",
    message: "アプリケーションの設定に問題があります。",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "サーバーに接続できませんでした。通信環境を確認してください。",
  },
  RESPONSE_PARSE_ERROR: {
    code: "RESPONSE_PARSE_ERROR",
    message: "サーバーからの応答を読み取れませんでした。",
  },
  UNEXPECTED_ERROR: {
    code: "UNEXPECTED_ERROR",
    message: "予期しないエラーが発生しました。",
  },
} as const satisfies Record<string, ClientErrorDefinition>;

export class ClientError extends Error {
  public readonly code: string;

  constructor(
    definition: ClientErrorDefinition,
    options?: ErrorOptions
  ) {
    super(definition.message, options);
    this.name = "ClientError";
    this.code = definition.code;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError || error instanceof ClientError) {
    return error.message;
  }

  return ClientErrors.UNEXPECTED_ERROR.message;
}
