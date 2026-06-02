export function AuthBrand() {
  return (
    <div className="mb-6 flex flex-col items-center space-y-3 text-center">
      <img
        src="/recwatch-logo.svg"
        alt=""
        aria-hidden="true"
        className="h-14 w-auto"
      />
      <div className="text-[24px] font-semibold tracking-[0.02em] whitespace-nowrap text-[color:var(--text-1)]">
        rec<em className="text-[color:var(--brand-1)] not-italic">watch</em>
      </div>
    </div>
  );
}
