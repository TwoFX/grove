"use client";

import { useGroveStore } from "@/lib/state/state";
import { JSX } from "react";
import { FaRedo, FaUndo } from "react-icons/fa";
import { useStore } from "zustand";

export function UndoButton(): JSX.Element {
  const { undo, pastStates } = useStore(useGroveStore.temporal);
  const canUndo = !!pastStates.length;

  return (
    <button
      disabled={!canUndo}
      onClick={() => undo()}
      className={`px-2 rounded-md ${canUndo ? "cursor-pointer hover:bg-surface-active" : "text-text-disabled"}`}
    >
      <FaUndo />
    </button>
  );
}

export function RedoButton(): JSX.Element {
  const { redo, futureStates } = useStore(useGroveStore.temporal);
  const canRedo = !!futureStates.length;

  return (
    <button
      disabled={!canRedo}
      onClick={() => redo()}
      className={`px-2 rounded-md ${canRedo ? "cursor-pointer hover:bg-surface-active" : "text-text-disabled"}`}
    >
      <FaRedo />
    </button>
  );
}
