function readStringEnv(value: string | undefined, fallback = "") {
  return value?.trim() ?? fallback;
}

export const env = {
  backendBaseUrl: readStringEnv(import.meta.env.VITE_BACKEND_BASE_URL),
};
