import {
  createShowDeclarationSlice,
  ShowDeclarationSlice,
} from "@/widgets/show-declaration/state/create";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { createUISlice, UISlice } from "./slices/ui";
import { createHashSlice, HashSlice } from "./slices/hash";
import { produce } from "immer";
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

export interface HasHydratedSlice {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const createHasHydratedSlice: StateCreator<
  HasHydratedSlice,
  [],
  [],
  HasHydratedSlice
> = (set) => ({
  hasHydrated: false,
  setHasHydrated: (hasHydrated) =>
    set((state) =>
      produce(state, (draft) => {
        draft.hasHydrated = hasHydrated;
      }),
    ),
});

export type GroveAdminState = HasHydratedSlice & HashSlice;

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
    (...a) => ({
      ...createHasHydratedSlice(...a),
      ...createHashSlice(...a),
    }),
    {
      name: "grove-admin-storage",
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
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
          persist(storeInitializer, {
            name: "grove-temporal-storage",
          }),
      },
    ),
    {
      name: "grove-storage",
    },
  ),
);
