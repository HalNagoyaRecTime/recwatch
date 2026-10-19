import { ApiClientError } from "~/lib/api-client-error";

export function readApiErrorStatus(error: unknown): number | null {
  if (error instanceof ApiClientError) {
    return error.status;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}
