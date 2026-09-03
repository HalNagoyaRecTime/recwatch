import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { ReactNode } from "react";

import type { Route } from "./+types/root";
import { THEME_STORAGE_KEY } from "./lib/theme";
import { ThemeProvider } from "~/components/providers/ThemeProvider";
import "./app.css";

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
                var storedTheme = window.localStorage.getItem(storageKey);
                var theme = ["light", "dark", "system"].includes(storedTheme)
                  ? storedTheme
                  : "system";
                var root = document.documentElement;
                var isDark =
                  theme === "dark" ||
                  (theme === "system" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches);
                root.classList.toggle("dark", isDark);
                root.dataset.theme = theme;
                root.style.colorScheme = isDark ? "dark" : "light";
              })();
            `,
          }}
        />
      </head>
      <body className="text-text-base min-h-dvh bg-[radial-gradient(circle_at_top_right,var(--bg-gradient-glow),transparent_32%),linear-gradient(180deg,var(--bg-gradient-start)_0%,var(--bg-gradient-end)_100%)] antialiased transition-colors duration-200">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Unexpected error";
  let details = "A route failed while rendering the admin frame.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Route error";
    details =
      error.status === 404
        ? "The requested admin screen does not exist."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-dvh p-6 md:p-8">
      <div className="shadow-soft border-border-subtle bg-surface-base mx-auto max-w-5xl rounded-3xl border p-6 md:p-8">
        <div className="text-brand-primary font-['DM_Mono'] text-xs tracking-[0.18em] uppercase">
          Failure Boundary
        </div>
        <h1 className="mt-3 text-[clamp(28px,4vw,40px)] leading-[1.04] font-semibold">
          {message}
        </h1>
        <p className="text-text-muted mt-3 max-w-[50ch] text-sm leading-7">
          {details}
        </p>
        {stack ? (
          <pre className="border-border-subtle bg-surface-hover text-text-muted mt-5 overflow-x-auto rounded-2xl border p-4 text-xs">
            <code>{stack}</code>
          </pre>
        ) : null}
      </div>
    </main>
  );
}

export function HydrateFallback() {
  return <div className="bg-surface-hover p-6">読み込み中...</div>;
}
