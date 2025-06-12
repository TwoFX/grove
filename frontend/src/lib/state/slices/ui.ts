import { produce } from "immer";
import { StateCreator } from "zustand";

export interface UISlice {
  collapsed: { [key: string]: boolean };
  toggleCollapsed: (key: string) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  collapsed: {},
  toggleCollapsed: (key) =>
    set((state) =>
      produce(state, (draft) => {
        draft.collapsed[key] = !draft.collapsed[key];
      }),
    ),
});
