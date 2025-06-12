import { produce } from "immer";
import { StateCreator } from "zustand";

export interface HashSlice {
  hash: string;
  setHash: (hash: string) => void;
}

export const createHashSlice: StateCreator<HashSlice, [], [], HashSlice> = (
  set,
) => ({
  hash: "",
  setHash: (hash) =>
    set((state) =>
      produce(state, (draft) => {
        draft.hash = hash;
      }),
    ),
});
