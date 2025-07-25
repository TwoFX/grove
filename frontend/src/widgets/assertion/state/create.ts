import { updatePendingFacts } from "@/lib/state/util";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { AssertionFact } from "@/lib/transfer/project";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface AssertionSlice {
  pendingAssertionFacts: {
    [widgetId: string]: { [factId: string]: AssertionFact };
  };
  setPendingAssertionFact: (
    context: GroveContextData,
    widgetId: string,
    factId: string,
    fact: AssertionFact | undefined,
  ) => void;
  clearPendingAssertionFacts: (widgetId: string) => void;
}

export const createAssertionSlice: StateCreator<
  AssertionSlice,
  [],
  [],
  AssertionSlice
> = (set) => ({
  pendingAssertionFacts: {},
  setPendingAssertionFact: (context, widgetId, factId, fact) => {
    set((state) => ({
      pendingAssertionFacts: updatePendingFacts(
        context.assertionFact,
        state.pendingAssertionFacts,
        widgetId,
        factId,
        fact,
      ),
    }));
  },
  clearPendingAssertionFacts: (widgetId) => {
    set((state) =>
      produce(state, (draft) => {
        delete draft.pendingAssertionFacts[widgetId];
      }),
    );
  },
});
