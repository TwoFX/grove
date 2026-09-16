import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import {
  createJSONStorage,
  PersistOptions,
  StateStorage,
} from "zustand/middleware";

interface PersistenceStatus {
  pending: string[];
  loadFailed: boolean;
  writeFailed: boolean;
}

// Startup and error status must stay in memory, outside the persisted stores.
export const usePersistenceStatus = create<PersistenceStatus>()(() => ({
  pending: [],
  loadFailed: false,
  writeFailed: false,
}));

function reportWriteFailure(error: unknown) {
  console.error("Could not persist Grove state", error);
  usePersistenceStatus.setState({ writeFailed: true });
}

const indexedDBStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => {
    try {
      await set(name, value);
    } catch (error) {
      reportWriteFailure(error);
    }
  },
  removeItem: async (name) => {
    try {
      await del(name);
    } catch (error) {
      reportWriteFailure(error);
    }
  },
};

export function persistenceOptions<T>(name: string): PersistOptions<T> {
  return {
    name,
    // Keep JSON serialization so store actions are excluded from snapshots.
    storage: createJSONStorage(() => indexedDBStorage),
    onRehydrateStorage: () => {
      usePersistenceStatus.setState((state) => ({
        pending: [...state.pending.filter((key) => key !== name), name],
      }));

      return (_state, error) => {
        if (error) {
          console.error(`Could not restore ${name}`, error);
        }
        usePersistenceStatus.setState((state) => ({
          pending: state.pending.filter((key) => key !== name),
          loadFailed: state.loadFailed || Boolean(error),
        }));
      };
    },
  };
}
