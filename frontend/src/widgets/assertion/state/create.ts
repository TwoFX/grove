import { AssertionFact } from "@/lib/transfer/project";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface AssertionSlice {
  pendingAssertionFacts: {
    [widgetId: string]: { [factId: string]: AssertionFact };
  };
  setPendingAssertionFact: (
    widgetId: string,
    factId: string,
    fact: AssertionFact,
  ) => void;
  clearPendingAssertionFacts: () => void;
}

export const createAssertionSlice: StateCreator<
  AssertionSlice,
  [],
  [],
  AssertionSlice
> = (set) => ({
  pendingAssertionFacts: {},
  setPendingAssertionFact: (widgetId, factId, fact) => {
    set((state) =>
      produce(state, (draft) => {
        if (!draft.pendingAssertionFacts[widgetId]) {
          draft.pendingAssertionFacts[widgetId] = {};
        }
        draft.pendingAssertionFacts[widgetId][factId] = fact;
      }),
    );
  },
  clearPendingAssertionFacts: () => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingAssertionFacts = {};
      }),
    );
  },
});
