import { create } from "zustand";

type LeftNavigationHoverState = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
};

export const useLeftNavigationHoverState = create<LeftNavigationHoverState>()(
  (set) => ({
    isHovering: false,
    setHovering: (value) => set({ isHovering: value }),
  })
);
