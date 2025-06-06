import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GroveState {
  collapsed: { [key: string]: boolean };
  toggleCollapsed: (key: string) => void;
}

export const useGroveStore = create<GroveState>()(
  persist(
    (set) => ({
      collapsed: {},
      toggleCollapsed: (key) =>
        set((state) =>
          produce(state, (draft) => {
            draft.collapsed[key] = !draft.collapsed[key];
          }),
        ),
    }),
    { name: "grove-storage" },
  ),
);
