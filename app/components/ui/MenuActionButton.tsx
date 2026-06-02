import type { ReactNode } from "react";

type MenuActionButtonProps = {
  content: ReactNode;
  onClick: () => void;
};

export function MenuActionButton({ content, onClick }: MenuActionButtonProps) {
  return (
    <button
      type="button"
      className="flex h-8.5 w-full cursor-pointer items-center gap-2.5 rounded-md bg-transparent px-2.5 text-left text-sm text-(--text-1) transition hover:bg-(--surface-2)"
      onClick={onClick}
    >
      {content}
    </button>
  );
}
