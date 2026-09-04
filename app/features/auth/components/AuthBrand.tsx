export function AuthBrand() {
  return (
    <div className="mb-6 flex flex-col items-center space-y-3 text-center">
      <img
        src="/recwatch-logo.svg"
        alt=""
        aria-hidden="true"
        className="h-14 w-auto"
      />
      <div className="text-text-base text-2xl font-semibold tracking-[0.02em] whitespace-nowrap">
        rec<em className="text-brand-primary not-italic">watch</em>
      </div>
    </div>
  );
}
