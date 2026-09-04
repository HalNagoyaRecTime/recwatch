export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details: unknown;

  constructor(
    public readonly status: number,
    message: string,
    code = "UNKNOWN_API_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}
