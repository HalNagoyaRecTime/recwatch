export default function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer-height shrink-0 border-t border-(--border-1) bg-(--surface-overlay)/95 px-3 backdrop-blur-xl">
      <div className="flex h-full items-center justify-center text-[12px] text-(--text-3)">
        <p>&copy; {currentYear} recwatch - the admin console for rectime.</p>
      </div>
    </footer>
  );
}
