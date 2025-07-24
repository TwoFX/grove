import { updatePendingFacts } from "@/lib/state/util";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { ShowDeclarationFact } from "@/lib/transfer/project";
import { StateCreator } from "zustand";

export interface ShowDeclarationSlice {
  pendingShowDeclarationFacts: {
    [widgetId: string]: { [factId: string]: ShowDeclarationFact };
  };
  setPendingShowDeclarationFact: (
    context: GroveContextData,
    widgetId: string,
    factId: string,
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
  setPendingShowDeclarationFact: (context, widgetId, factId, fact) => {
    set((state) => ({
      pendingShowDeclarationFacts: updatePendingFacts(
        context.showDeclarationFact,
        state.pendingShowDeclarationFacts,
        widgetId,
        factId,
        fact,
      ),
    }));
  },
});
