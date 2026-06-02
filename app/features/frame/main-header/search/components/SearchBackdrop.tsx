type SearchBackdropProps = {
  isActive: boolean;
  onClose: () => void;
};

export function SearchBackdrop({ isActive, onClose }: SearchBackdropProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-120 bg-black/30 backdrop-blur-sm transition-all duration-500 ease-in-out ${
        isActive
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    />
  );
}
