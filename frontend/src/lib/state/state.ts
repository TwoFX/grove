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

export interface HasHydratedSlice {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const createHasHydratedSlice: StateCreator<
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

export type GroveState = HasHydratedSlice &
  HashSlice &
  UISlice &
  ShowDeclarationSlice &
  AssociationTableSlice;

export const useGroveStore = create<GroveState>()(
  persist(
    (...a) => ({
      ...createHasHydratedSlice(...a),
      ...createHashSlice(...a),
      ...createUISlice(...a),
      ...createShowDeclarationSlice(...a),
      ...createAssociationTableSlice(...a),
    }),
    {
      name: "grove-storage",
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
  ),
);
