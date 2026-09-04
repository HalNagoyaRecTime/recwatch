import { appConfig } from "~/config/app";

export function AuthFooter() {
  const year = new Date().getFullYear();
  const footerText = `© ${appConfig.appName} ${year}`;

  return (
    <footer className="text-text-muted w-full py-6 text-center text-xs font-medium tracking-[0.08em]">
      {footerText}
    </footer>
  );
}
