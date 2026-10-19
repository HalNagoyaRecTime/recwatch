export function AuthFooter() {
  const year = new Date().getFullYear();
  const footerText = `@recwatch${year}`.replace(
    /^@([a-zA-Z]+)(\d{4})$/,
    "© $1 $2"
  );

  return (
    <footer className="text-text-muted w-full py-6 text-center text-xs font-medium tracking-[0.08em]">
      {footerText}
    </footer>
  );
}
