import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NavState = {
  isOpen: boolean;
  openAccordions: string[];
  toggle: () => void;
  toggleAccordion: (id: string) => void;
  closeForMobile: () => void;
};

export const useNavState = create<NavState>()(
  persist(
    (set) => ({
      isOpen: true,
      openAccordions: [],
      toggle: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          openAccordions: state.isOpen ? [] : state.openAccordions,
        })),
      toggleAccordion: (id) =>
        set((state) => ({
          openAccordions: state.openAccordions.includes(id)
            ? state.openAccordions.filter((value) => value !== id)
            : [...state.openAccordions, id],
        })),
      closeForMobile: () =>
        set(() => ({
          isOpen: false,
          openAccordions: [],
        })),
    }),
    {
      name: "rectime-nav-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
