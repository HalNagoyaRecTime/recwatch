export function AccountDeletionFooter() {
  return (
    <footer className="mt-auto w-full pt-8 pb-[calc(8px+env(safe-area-inset-bottom,0px))] text-center text-xs leading-4 text-[#808080]">
      <nav
        aria-label="利用規約とプライバシーポリシー"
        className="mb-1 flex flex-wrap justify-center text-[13px] text-[#4E5565]"
      >
        <a
          className="inline-flex min-h-12 items-center rounded px-3 focus-visible:outline-2"
          href="https://recwatch.pages.dev/legal/terms.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          利用規約
        </a>
        <a
          className="inline-flex min-h-12 items-center rounded px-3 focus-visible:outline-2"
          href="https://recwatch.pages.dev/legal/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          プライバシーポリシー
        </a>
      </nav>
      <p>Produced by HAL Nagoya</p>
      <p>Developed by RE:CREATION App Team</p>
    </footer>
  );
}
