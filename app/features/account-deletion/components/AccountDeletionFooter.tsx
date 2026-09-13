export function AccountDeletionFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-text-muted w-full py-6 text-center text-xs font-medium tracking-[0.08em]">
      © RE:CREATION {year}
    </footer>
  );
}
