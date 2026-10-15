import { appConfig } from "~/config/app";

export function AuthFooter() {
  const year = new Date().getFullYear();
  const footerText = `© ${appConfig.appName} ${year}`;

  return (
    <footer className="text-text-muted w-full py-6 text-center text-xs font-medium">
      <nav aria-label="法務情報">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <li>
            <a
              className="decoration-text-muted hover:text-text-base underline underline-offset-4"
              href="/legal/terms.html"
            >
              利用規約
            </a>
          </li>
          <li>
            <a
              className="decoration-text-muted hover:text-text-base underline underline-offset-4"
              href="/legal/privacy.html"
            >
              プライバシーポリシー
            </a>
          </li>
        </ul>
      </nav>
      <p className="mt-3 tracking-[0.08em]">{footerText}</p>
    </footer>
  );
}
