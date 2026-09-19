function AccountDeletionLogoMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-30 w-30"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.4 14.4c-8.98 4.71-13.4-4.63-8.65-13.11-9.88 12.23 2.61 28.04 8.65 13.11Z"
        fill="#2AB3BF"
        fillOpacity="0.8"
      />
      <path
        d="M14.55 4.62 3.47 20.43l5.91-1.02Z"
        fill="#FCB100"
        fillOpacity="0.8"
      />
      <path
        d="M1.98 12.6c6.63-8.1 29.54-8.72 12.62 2.43 4.71-10.13-10.28-5.07-12.62-2.43Z"
        fill="#FF4000"
        fillOpacity="0.8"
      />
    </svg>
  );
}

export function AccountDeletionBrand() {
  return (
    <div className="flex flex-col items-center">
      <AccountDeletionLogoMark />
      <span className="-mt-3 mb-2 text-base leading-none font-black text-[#333333]">
        RE:CREATION
      </span>
    </div>
  );
}
