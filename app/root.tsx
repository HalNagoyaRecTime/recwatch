import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { THEME_STORAGE_KEY } from "./lib/theme";
import "./app.css";

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
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
                var theme = storedTheme === "light" ? "light" : "dark";
                var root = document.documentElement;
                root.classList.toggle("dark", theme === "dark");
                root.dataset.theme = theme;
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-dvh bg-[radial-gradient(circle_at_top_right,var(--bg-glow),transparent_32%),linear-gradient(180deg,var(--bg-top)_0%,var(--bg-bottom)_100%)] text-[color:var(--text-1)] antialiased transition-colors duration-200">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
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
      <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-[color:var(--border-1)] bg-[color:var(--surface-1)] p-6 shadow-[var(--shadow-soft)] md:p-8">
        <div className="font-['DM_Mono'] text-xs tracking-[0.18em] text-[color:var(--brand-2)] uppercase">
          Failure Boundary
        </div>
        <h1 className="mt-3 text-[clamp(28px,4vw,40px)] leading-[1.04] font-semibold">
          {message}
        </h1>
        <p className="mt-3 max-w-[50ch] text-sm leading-7 text-[color:var(--text-2)]">
          {details}
        </p>
        {stack ? (
          <pre className="mt-5 overflow-x-auto rounded-2xl border border-[color:var(--border-1)] bg-[color:var(--surface-2)] p-4 text-xs text-[color:var(--text-2)]">
            <code>{stack}</code>
          </pre>
        ) : null}
      </div>
    </main>
  );
}
