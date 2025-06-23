import { TableFact, TableState } from "@/lib/transfer/project";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface TableSlice {
  pendingTableFacts: {
    [widgetId: string]: { [factId: string]: TableFact };
  };
  setPendingTableFact: (
    widgetId: string,
    factId: string,
    fact: TableFact,
  ) => void;
  clearPendingTableFacts: () => void;

  pendingTableStates: {
    [widgetId: string]: TableState;
  };
  setPendingTableState: (widgetId: string, state: TableState) => void;
  clearPendingTableStates: () => void;
}

export const createTableSlice: StateCreator<TableSlice, [], [], TableSlice> = (
  set,
) => ({
  pendingTableFacts: {},
  setPendingTableFact: (widgetId, factId, fact) => {
    set((state) =>
      produce(state, (draft) => {
        if (!draft.pendingTableFacts[widgetId]) {
          draft.pendingTableFacts[widgetId] = {};
        }
        draft.pendingTableFacts[widgetId][factId] = fact;
      }),
    );
  },
  clearPendingTableFacts: () => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingTableFacts = {};
      }),
    );
  },

  pendingTableStates: {},
  setPendingTableState: (widgetId, st) => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingTableStates[widgetId] = st;
      }),
    );
  },
  clearPendingTableStates: () => {
    set((state) =>
      produce(state, (draft) => {
        draft.pendingTableStates = {};
      }),
    );
  },
});
