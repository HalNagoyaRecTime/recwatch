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
