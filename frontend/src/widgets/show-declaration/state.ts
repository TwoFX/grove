import { ShowDeclarationFact } from "@/lib/transfer";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface ShowDeclarationSlice {
  pendingShowDeclarationFacts: { [key: string]: ShowDeclarationFact };
  setPendingShowDeclarationFact: (
    key: string,
    fact: ShowDeclarationFact,
  ) => void;
}

export const createShowDeclarationSlice: StateCreator<
  ShowDeclarationSlice,
  [],
  [],
  ShowDeclarationSlice
> = (set) => ({
  pendingShowDeclarationFacts: {},
  setPendingShowDeclarationFact: (key, fact) => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingShowDeclarationFacts[key] = fact;
      }),
    );
  },
});
