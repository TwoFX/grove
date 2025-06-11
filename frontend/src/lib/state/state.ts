import {
  createShowDeclarationSlice,
  ShowDeclarationSlice,
} from "@/widgets/show-declaration/state";
import { produce } from "immer";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { ShowDeclarationFact } from "../transfer";
import { useContext } from "react";
import { GroveContext } from "../transfer/context";

interface UISlice {
  collapsed: { [key: string]: boolean };
  toggleCollapsed: (key: string) => void;
}

const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  collapsed: {},
  toggleCollapsed: (key) =>
    set((state) =>
      produce(state, (draft) => {
        draft.collapsed[key] = !draft.collapsed[key];
      }),
    ),
});

export type GroveState = UISlice & ShowDeclarationSlice;

export const useGroveStore = create<GroveState>()(
  persist(
    (...a) => ({
      ...createUISlice(...a),
      ...createShowDeclarationSlice(...a),
    }),
    { name: "grove-storage" },
  ),
);

// TODO: move to new file in the right folder?
export function usePendingShowDeclarationFact(): (
  widgetId: string,
  key: string,
) => ShowDeclarationFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingShowDeclarationFacts,
  );

  return (widgetId, factId) =>
    pendingFact[widgetId]?.[factId] ??
    groveContextData.showDeclarationFact[widgetId]?.[factId];
}
