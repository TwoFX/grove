import { updatePendingFacts, updatePendingState } from "@/lib/state/util";
import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  AssociationTableFact,
  AssociationTableState,
} from "@/lib/transfer/project";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface AssociationTableSlice {
  pendingAssociationTableFacts: {
    [widgetId: string]: { [factId: string]: AssociationTableFact };
  };
  setPendingAssociationTableFact: (
    context: GroveContextData,
    widgetId: string,
    factId: string,
    fact: AssociationTableFact,
  ) => void;
  clearPendingAssociationTableFacts: (widgetId: string) => void;

  pendingAssociationTableStates: {
    [widgetId: string]: AssociationTableState;
  };
  setPendingAssociationTableState: (
    context: GroveContextData,
    widgetId: string,
    state: AssociationTableState,
  ) => void;
  clearPendingAssociationTableState: (widgetId: string) => void;
}

export const createAssociationTableSlice: StateCreator<
  AssociationTableSlice,
  [],
  [],
  AssociationTableSlice
> = (set) => ({
  pendingAssociationTableFacts: {},
  setPendingAssociationTableFact: (context, widgetId, factId, fact) => {
    set((state) => ({
      pendingAssociationTableFacts: updatePendingFacts(
        context.associationTableFact,
        state.pendingAssociationTableFacts,
        widgetId,
        factId,
        fact,
      ),
    }));
  },
  clearPendingAssociationTableFacts: (widgetId) => {
    set((state) =>
      produce(state, (draft) => {
        delete draft.pendingAssociationTableFacts[widgetId];
      }),
    );
  },

  pendingAssociationTableStates: {},
  setPendingAssociationTableState: (context, widgetId, st) => {
    set((state) => ({
      pendingAssociationTableStates: updatePendingState(
        context.associationTableState,
        state.pendingAssociationTableStates,
        widgetId,
        st,
      ),
    }));
  },
  clearPendingAssociationTableState: (widgetId) => {
    set((state) =>
      produce(state, (draft) => {
        delete draft.pendingAssociationTableStates[widgetId];
      }),
    );
  },
});
