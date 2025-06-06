import { ShowDeclarationFact } from "@/transfer";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GroveState {
  collapsed: { [key: string]: boolean };
  toggleCollapsed: (key: string) => void;

  // TODO: refactor to use a map instead
  pendingShowDeclarationFacts: { [key: string]: ShowDeclarationFact };
  setPendingShowDeclarationFact: (
    key: string,
    fact: ShowDeclarationFact,
  ) => void;
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

      pendingShowDeclarationFacts: {},
      setPendingShowDeclarationFact: (key, fact) => {
        set((state) =>
          produce(state, (draft) => {
            draft.pendingShowDeclarationFacts[key] = fact;
          }),
        );
      },
    }),
    { name: "grove-storage" },
  ),
);
