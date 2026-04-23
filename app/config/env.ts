function readStringEnv(value: string | undefined, fallback = "") {
  if (value === undefined) {
    return fallback;
  }

  return value.trim();
}

export const env = {
  backendBaseUrl: readStringEnv(import.meta.env.VITE_BACKEND_BASE_URL),
};
