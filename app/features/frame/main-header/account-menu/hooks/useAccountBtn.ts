import { useEffect, useRef, useState } from "react";

export function useAccountBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  function toggle() {
    setIsOpen((value) => !value);
  }

  function close() {
    setIsOpen(false);
  }

  return {
    close,
    isOpen,
    rootRef,
    toggle,
  };
}
