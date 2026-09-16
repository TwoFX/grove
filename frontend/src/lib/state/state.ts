import {
  createShowDeclarationSlice,
  ShowDeclarationSlice,
} from "@/widgets/show-declaration/state/create";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { createUISlice, UISlice } from "./slices/ui";
import { createHashSlice, HashSlice } from "./slices/hash";
import {
  AssociationTableSlice,
  createAssociationTableSlice,
} from "@/widgets/association-table/state/create";
import { createTableSlice, TableSlice } from "@/widgets/table/state/create";
import {
  AssertionSlice,
  createAssertionSlice,
} from "@/widgets/assertion/state/create";
import { temporal } from "zundo";
import { persistenceOptions } from "./persistence";

export type GroveAdminState = HashSlice;

export type GroveState = UISlice &
  ShowDeclarationSlice &
  AssociationTableSlice &
  AssertionSlice &
  TableSlice &
  ClearAllSlice;
export interface ClearAllSlice {
  clearAll: () => void;
}

const createClearAllSlice: StateCreator<GroveState, [], [], ClearAllSlice> = (
  set,
) => ({
  clearAll: () => {
    set({
      pendingShowDeclarationFacts: {},
      pendingAssociationTableFacts: {},
      pendingAssociationTableStates: {},
      pendingTableFacts: {},
      pendingTableStates: {},
      pendingAssertionFacts: {},
    });
  },
});

export const useGroveAdminStore = create<GroveAdminState>()(
  persist(
    createHashSlice,
    persistenceOptions<GroveAdminState>("grove-admin-storage"),
  ),
);

export const useGroveStore = create<GroveState>()(
  persist(
    temporal(
      (...a) => ({
        ...createUISlice(...a),
        ...createShowDeclarationSlice(...a),
        ...createAssociationTableSlice(...a),
        ...createAssertionSlice(...a),
        ...createTableSlice(...a),
        ...createClearAllSlice(...a),
      }),
      {
        limit: 10,
        wrapTemporal: (storeInitializer) =>
          persist(
            storeInitializer,
            persistenceOptions<ReturnType<typeof storeInitializer>>(
              "grove-temporal-storage",
            ),
          ),
      },
    ),
    persistenceOptions<GroveState>("grove-storage"),
  ),
);
