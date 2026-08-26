import { appConfig } from "~/config/app";

export default function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer-height border-border-subtle bg-surface-layout/95 shrink-0 border-t px-3 backdrop-blur-xl">
      <div className="text-text-subtle flex h-full items-center justify-center text-[12px]">
        <p>
          &copy; {currentYear} {appConfig.appName} - the admin console for
          rectime.
        </p>
      </div>
    </footer>
  );
}
