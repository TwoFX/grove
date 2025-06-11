import {
  createShowDeclarationSlice,
  ShowDeclarationSlice,
} from "@/widgets/show-declaration/state";
import { produce } from "immer";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";

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

export const useGroveStore = create<UISlice & ShowDeclarationSlice>()(
  persist(
    (...a) => ({
      ...createUISlice(...a),
      ...createShowDeclarationSlice(...a),
    }),
    { name: "grove-storage" },
  ),
);
