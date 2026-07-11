import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const BACKEND_BASE_URL_ENV_NAME = "VITE_BACKEND_BASE_URL";

function parseBackendBaseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    throw new Error(
      `${BACKEND_BASE_URL_ENV_NAME} must be an http:// or https:// URL.`
    );
  }
}

function validateBackendBaseUrl(mode: string) {
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");
  const value = (
    process.env[BACKEND_BASE_URL_ENV_NAME] ?? fileEnv[BACKEND_BASE_URL_ENV_NAME]
  )?.trim();

  if (!value) {
    throw new Error(
      `${BACKEND_BASE_URL_ENV_NAME} is required. ` +
        "Copy .env.example to .env for local development, or set it as a GitHub Environment variable."
    );
  }

  const url = parseBackendBaseUrl(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `${BACKEND_BASE_URL_ENV_NAME} must be an http:// or https:// URL.`
    );
  }
}

export default defineConfig(({ mode }) => {
  validateBackendBaseUrl(mode);

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      host: "0.0.0.0",
    },
  };
});
