import { updatePendingFacts, updatePendingState } from "@/lib/state/util";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { TableFact, TableState } from "@/lib/transfer/project";
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

  pendingTableStates: {
    [widgetId: string]: TableState;
  };
  setPendingTableState: (
    context: GroveContextData,
    widgetId: string,
    state: TableState,
  ) => void;
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
});
