import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { useLayoutEffect, type ReactNode } from "react";

import type { Route } from "./+types/root";
import {
  createAppSurfaceBootstrapScript,
  getCurrentAppSurface,
  synchronizeAppSurfaceDocument,
} from "./lib/appSurface";
import { ThemeProvider } from "~/components/providers/ThemeProvider";
import "./app.css";

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    href: "/recwatch-logo.svg",
    type: "image/svg+xml",
    sizes: "any",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const appSurfaceBootstrapScript = createAppSurfaceBootstrapScript();

  return (
    <html lang="en" data-app-surface="recwatch" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{ __html: appSurfaceBootstrapScript }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const surface = getCurrentAppSurface(pathname);

  useLayoutEffect(() => {
    synchronizeAppSurfaceDocument(pathname, surface);
  }, [pathname, surface]);

  return (
    <ThemeProvider
      forcedTheme={surface === "account-deletion" ? "light" : undefined}
    >
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
    <main className="viewport-min-height p-6 md:p-8">
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
  return (
    <div className="root-hydrate-fallback viewport-min-height bg-surface-hover p-6">
      <span className="root-hydrate-fallback-default">読み込み中...</span>
      <span className="root-hydrate-fallback-context">
        <span>認証情報を確認しています...</span>
      </span>
    </div>
  );
}
