type SearchBackdropProps = {
  isActive: boolean;
  onClose: () => void;
};

export function SearchBackdrop({ isActive, onClose }: SearchBackdropProps) {
  return (
    <div
      data-search-backdrop
      aria-hidden="true"
      onClick={onClose}
      className={`fixed inset-0 z-120 touch-none bg-black/30 backdrop-blur-sm transition-all duration-500 ease-in-out motion-reduce:transition-none ${
        isActive
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    />
  );
}
