import { useEffect, type ReactNode } from "react";

import { AuthBrand } from "~/features/auth/components/AuthBrand";
import { AuthFooter } from "~/features/auth/components/AuthFooter";

type AuthLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function AuthLayout({
  children,
  contentClassName = "w-full max-w-sm flex-1 flex flex-col justify-center",
}: AuthLayoutProps) {
  useEffect(() => {
    const body = document.body;
    const previousAuthSafeArea = body.getAttribute("data-auth-safe-area");
    body.dataset.authSafeArea = "true";

    const viewportMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]'
    );
    const previousViewportContent = viewportMeta?.content ?? null;

    if (viewportMeta && !viewportMeta.content.includes("viewport-fit=cover")) {
      viewportMeta.content = `${viewportMeta.content}, viewport-fit=cover`;
    }

    return () => {
      if (viewportMeta && previousViewportContent !== null) {
        viewportMeta.content = previousViewportContent;
      }
      if (previousAuthSafeArea === null) {
        body.removeAttribute("data-auth-safe-area");
      } else {
        body.setAttribute("data-auth-safe-area", previousAuthSafeArea);
      }
    };
  }, []);

  return (
    <main className="auth-safe-viewport flex flex-col items-center justify-center">
      <section className={contentClassName}>
        <AuthBrand />
        {children}
      </section>
      <AuthFooter />
    </main>
  );
}
