import { applyTheme, getPreferredTheme, THEME_STORAGE_KEY } from "~/lib/theme";
import { DELETION_AUTH_PENDING_STORAGE_KEY } from "~/config/storageKeys";

export type AppSurface = "recwatch" | "account-deletion";

export const ACCOUNT_DELETION_AUTH_LOADING_CONTEXT = "account-deletion-auth";

const AUTH_CALLBACK_PATH = "/auth/callback";
const RECWATCH_FAVICON_HREF = "/recwatch-logo.svg";
const ACCOUNT_DELETION_FAVICON_HREF = "/recreation-favicon.png";
const RECWATCH_FAVICON_TYPE = "image/svg+xml";
const ACCOUNT_DELETION_FAVICON_TYPE = "image/png";
const RECWATCH_FAVICON_SIZES = "any";
const ACCOUNT_DELETION_FAVICON_SIZES = "512x512";
const ACCOUNT_DELETION_THEME_COLOR = "#ffffff";
const APP_SURFACE_THEME_COLOR_ATTRIBUTE = "data-app-surface-theme-color";

export function getAppSurface(
  pathname: string,
  deletionAuthPending = false
): AppSurface {
  if (
    pathname === "/account-deletion" ||
    pathname.startsWith("/account-deletion/")
  ) {
    return "account-deletion";
  }

  if (pathname === "/auth/callback" && deletionAuthPending) {
    return "account-deletion";
  }

  return "recwatch";
}

export function hasDeletionAuthPending(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(DELETION_AUTH_PENDING_STORAGE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function getCurrentAppSurface(pathname: string): AppSurface {
  const root =
    typeof document === "undefined" ? null : document.documentElement;
  const isPreHydrationDeletionCallback =
    pathname === AUTH_CALLBACK_PATH &&
    root?.dataset.appSurface === "account-deletion" &&
    root.dataset.appLoadingContext === ACCOUNT_DELETION_AUTH_LOADING_CONTEXT;

  if (isPreHydrationDeletionCallback) {
    return "account-deletion";
  }

  return getAppSurface(pathname, hasDeletionAuthPending());
}

export function getDocumentAppSurface(): AppSurface {
  if (typeof document === "undefined") {
    return "recwatch";
  }

  const surface = document.documentElement.dataset.appSurface;
  return surface === "account-deletion" ? surface : "recwatch";
}

function synchronizeThemeColor(surface: AppSurface): void {
  const themeColorMeta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );

  if (surface === "account-deletion") {
    const meta = themeColorMeta ?? document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", ACCOUNT_DELETION_THEME_COLOR);
    meta.setAttribute(APP_SURFACE_THEME_COLOR_ATTRIBUTE, "true");

    if (!themeColorMeta) {
      document.head.append(meta);
    }
    return;
  }

  document
    .querySelectorAll<HTMLMetaElement>(
      `meta[name="theme-color"][${APP_SURFACE_THEME_COLOR_ATTRIBUTE}="true"]`
    )
    .forEach((meta) => meta.remove());
}

export function synchronizeAppSurfaceDocument(
  pathname: string,
  surface: AppSurface
): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const isDeletionAuthCallback =
    pathname === AUTH_CALLBACK_PATH && surface === "account-deletion";
  const keepPreHydrationContext =
    root.dataset.appLoadingContext === ACCOUNT_DELETION_AUTH_LOADING_CONTEXT;

  root.dataset.appSurface = surface;
  delete root.dataset.accountDeletionAuthCallback;
  delete root.dataset.documentBackgroundOverride;

  if (
    isDeletionAuthCallback &&
    (hasDeletionAuthPending() || keepPreHydrationContext)
  ) {
    root.dataset.appLoadingContext = ACCOUNT_DELETION_AUTH_LOADING_CONTEXT;
  } else {
    delete root.dataset.appLoadingContext;
  }

  const theme = surface === "account-deletion" ? "light" : getPreferredTheme();
  applyTheme(theme);
  synchronizeThemeColor(surface);

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.setAttribute(
      "href",
      surface === "account-deletion"
        ? ACCOUNT_DELETION_FAVICON_HREF
        : RECWATCH_FAVICON_HREF
    );
    favicon.setAttribute(
      "type",
      surface === "account-deletion"
        ? ACCOUNT_DELETION_FAVICON_TYPE
        : RECWATCH_FAVICON_TYPE
    );
    favicon.setAttribute(
      "sizes",
      surface === "account-deletion"
        ? ACCOUNT_DELETION_FAVICON_SIZES
        : RECWATCH_FAVICON_SIZES
    );
  }
}

export function createAppSurfaceBootstrapScript(): string {
  const resolveSurfaceSource = getAppSurface.toString();

  return `(function() {
    var resolveSurface = ${resolveSurfaceSource};
    var pathname = window.location.pathname;
    var deletionAuthPending = false;
    try {
      deletionAuthPending =
        window.sessionStorage.getItem(${JSON.stringify(DELETION_AUTH_PENDING_STORAGE_KEY)}) === "1";
    } catch {}

    var surface = resolveSurface(pathname, deletionAuthPending);
    var root = document.documentElement;
    root.dataset.appSurface = surface;

    if (pathname === ${JSON.stringify(AUTH_CALLBACK_PATH)} && deletionAuthPending) {
      root.dataset.appLoadingContext = ${JSON.stringify(ACCOUNT_DELETION_AUTH_LOADING_CONTEXT)};
    } else {
      delete root.dataset.appLoadingContext;
    }

    delete root.dataset.accountDeletionAuthCallback;
    delete root.dataset.documentBackgroundOverride;

    var theme = "light";
    if (surface === "recwatch") {
      var storedTheme = null;
      try {
        storedTheme = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
      } catch {}
      theme = ["light", "dark", "system"].includes(storedTheme) ? storedTheme : "system";
    }

    var isDark = theme === "dark";
    if (!isDark && theme === "system") {
      try {
        isDark = typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
      } catch {}
    }
    root.classList.toggle("dark", isDark);
    root.dataset.theme = theme;
    root.style.colorScheme = isDark ? "dark" : "light";
    var backgroundColor = isDark ? "#000000" : "#ffffff";
    root.style.backgroundColor = backgroundColor;
    if (document.body) {
      document.body.style.backgroundColor = backgroundColor;
    }

    var favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute("href", surface === "account-deletion"
        ? ${JSON.stringify(ACCOUNT_DELETION_FAVICON_HREF)}
        : ${JSON.stringify(RECWATCH_FAVICON_HREF)});
      favicon.setAttribute("type", surface === "account-deletion"
        ? ${JSON.stringify(ACCOUNT_DELETION_FAVICON_TYPE)}
        : ${JSON.stringify(RECWATCH_FAVICON_TYPE)});
      favicon.setAttribute("sizes", surface === "account-deletion"
        ? ${JSON.stringify(ACCOUNT_DELETION_FAVICON_SIZES)}
        : ${JSON.stringify(RECWATCH_FAVICON_SIZES)});
    }

    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (surface === "account-deletion") {
      var themeColorMetaWasMissing = !themeColorMeta;
      if (themeColorMetaWasMissing) {
        themeColorMeta = document.createElement("meta");
      }

      themeColorMeta.setAttribute("name", "theme-color");
      themeColorMeta.setAttribute("content", ${JSON.stringify(ACCOUNT_DELETION_THEME_COLOR)});
      themeColorMeta.setAttribute(${JSON.stringify(APP_SURFACE_THEME_COLOR_ATTRIBUTE)}, "true");
      if (themeColorMetaWasMissing) {
        document.head.appendChild(themeColorMeta);
      }
    } else {
      document.querySelectorAll('meta[name="theme-color"][${APP_SURFACE_THEME_COLOR_ATTRIBUTE}="true"]').forEach(function(meta) {
        meta.remove();
      });
    }
  })();`;
}
