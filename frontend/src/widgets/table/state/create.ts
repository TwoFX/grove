import { updatePendingFacts, updatePendingState } from "@/lib/state/util";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { TableFact, TableState } from "@/lib/transfer/project";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface TableSlice {
  pendingTableFacts: {
    [widgetId: string]: { [factId: string]: TableFact };
  };
  setPendingTableFact: (
    context: GroveContextData,
    widgetId: string,
    factId: string,
    fact: TableFact,
  ) => void;
  clearPendingTableFacts: (widgetId: string) => void;

  pendingTableStates: {
    [widgetId: string]: TableState;
  };
  setPendingTableState: (
    context: GroveContextData,
    widgetId: string,
    state: TableState,
  ) => void;
  clearPendingTableState: (widgetId: string) => void;
}

export const createTableSlice: StateCreator<TableSlice, [], [], TableSlice> = (
  set,
) => ({
  pendingTableFacts: {},
  setPendingTableFact: (context, widgetId, factId, fact) => {
    set((state) => ({
      pendingTableFacts: updatePendingFacts(
        context.tableFact,
        state.pendingTableFacts,
        widgetId,
        factId,
        fact,
      ),
    }));
  },
  clearPendingTableFacts: (widgetId) => {
    set((state) =>
      produce(state, (draft) => {
        delete draft.pendingTableFacts[widgetId];
      }),
    );
  },

  pendingTableStates: {},
  setPendingTableState: (context, widgetId, st) => {
    set((state) => ({
      pendingTableStates: updatePendingState(
        context.tableState,
        state.pendingTableStates,
        widgetId,
        st,
      ),
    }));
  },
  clearPendingTableState: (widgetId) => {
    set((state) =>
      produce(state, (draft) => {
        delete draft.pendingTableStates[widgetId];
      }),
    );
  },
});
