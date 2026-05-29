function readStringEnv(value: string | undefined, fallback = "") {
  return value?.trim() ?? fallback;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const env = {
  backendBaseUrl: trimTrailingSlash(
    readStringEnv(import.meta.env.VITE_BACKEND_BASE_URL)
  ),
};

export function hasBackendBaseUrl() {
  return env.backendBaseUrl.length > 0;
}

export function buildBackendUrl(path = "/") {
  if (!hasBackendBaseUrl()) {
    return null;
  }

  return new URL(path, `${env.backendBaseUrl}/`).toString();
}
