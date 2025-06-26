import { produce } from "immer";
import { StateCreator } from "zustand";

export interface UISlice {
  expanded: { [key: string]: boolean };
  toggleExpanded: (key: string) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  expanded: {},
  toggleExpanded: (key) =>
    set((state) =>
      produce(state, (draft) => {
        draft.expanded[key] = !draft.expanded[key];
      }),
    ),
});
