import { ApiClientError } from "./api-client-error";

export type ClientErrorDefinition = {
  readonly code: string;
  readonly message: string;
};

export const ClientErrors = {
  INVALID_REQUEST: {
    code: "CLIENT_INVALID_REQUEST",
    message: "入力内容を確認してください。",
  },
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

  constructor(definition: ClientErrorDefinition, options?: ErrorOptions) {
    super(definition.message, options);
    this.name = "ClientError";
    this.code = definition.code;
  }
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage?: string
): string {
  if (error instanceof ApiClientError) {
    return formatApiErrorMessage(error);
  }
  if (error instanceof ClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return fallbackMessage === undefined
      ? ClientErrors.UNEXPECTED_ERROR.message
      : error.message;
  }

  return fallbackMessage ?? ClientErrors.UNEXPECTED_ERROR.message;
}

function formatApiErrorMessage(error: ApiClientError): string {
  const details = error.details;
  if (!details || typeof details !== "object") return error.message;

  const messages: string[] = [];
  if ("formErrors" in details && Array.isArray(details.formErrors)) {
    messages.push(...details.formErrors.filter(isString));
  }
  if ("fieldErrors" in details && isRecord(details.fieldErrors)) {
    for (const [field, fieldMessages] of Object.entries(details.fieldErrors)) {
      if (Array.isArray(fieldMessages)) {
        messages.push(
          ...fieldMessages
            .filter(isString)
            .map((message) => `${field}: ${message}`)
        );
      }
    }
  }

  return messages.length > 0
    ? `${error.message} ${messages.join(" ")}`
    : error.message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
