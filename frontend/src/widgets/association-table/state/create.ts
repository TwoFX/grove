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
    widgetId: string,
    factId: string,
    fact: AssociationTableFact,
  ) => void;
  clearPendingAssociationTableFacts: () => void;

  pendingAssociationTableStates: {
    [widgetId: string]: AssociationTableState;
  };
  setPendingAssociationTableState: (
    widgetId: string,
    state: AssociationTableState,
  ) => void;
  clearPendingAssociationTableStates: () => void;
}

export const createAssociationTableSlice: StateCreator<
  AssociationTableSlice,
  [],
  [],
  AssociationTableSlice
> = (set) => ({
  pendingAssociationTableFacts: {},
  setPendingAssociationTableFact: (widgetId, factId, fact) => {
    set((state) =>
      produce(state, (draft) => {
        if (!draft.pendingAssociationTableFacts[widgetId]) {
          draft.pendingAssociationTableFacts[widgetId] = {};
        }
        draft.pendingAssociationTableFacts[widgetId][factId] = fact;
      }),
    );
  },
  clearPendingAssociationTableFacts: () => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingAssociationTableFacts = {};
      }),
    );
  },

  pendingAssociationTableStates: {},
  setPendingAssociationTableState: (widgetId, st) => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingAssociationTableStates[widgetId] = st;
      }),
    );
  },
  clearPendingAssociationTableStates: () => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingAssociationTableStates = {};
      }),
    );
  },
});
