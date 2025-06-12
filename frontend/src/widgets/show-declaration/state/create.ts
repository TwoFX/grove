import { ShowDeclarationFact } from "@/lib/transfer";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface ShowDeclarationSlice {
  pendingShowDeclarationFacts: {
    [widgetId: string]: { [factId: string]: ShowDeclarationFact };
  };
  setPendingShowDeclarationFact: (
    widgetId: string,
    factId: string,
    fact: ShowDeclarationFact,
  ) => void;
  clearPendingShowDeclarationFacts: () => void;
}

export const createShowDeclarationSlice: StateCreator<
  ShowDeclarationSlice,
  [],
  [],
  ShowDeclarationSlice
> = (set) => ({
  pendingShowDeclarationFacts: {},
  setPendingShowDeclarationFact: (widgetId, factId, fact) => {
    set((state) =>
      produce(state, (draft) => {
        if (!draft.pendingShowDeclarationFacts[widgetId]) {
          draft.pendingShowDeclarationFacts[widgetId] = {};
        }
        draft.pendingShowDeclarationFacts[widgetId][factId] = fact;
      }),
    );
  },
  clearPendingShowDeclarationFacts: () => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingShowDeclarationFacts = {};
      }),
    );
  },
});
