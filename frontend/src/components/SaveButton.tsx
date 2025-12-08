"use client";

import { saveFiles, useRenderers } from "@/lib/save/save";
import { useCountPendingChanges } from "@/lib/state/pending";
import { JSX, useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";

export function SaveButton(): JSX.Element {
  const context = useContext(GroveContext);
  const numFacts = useCountPendingChanges();
  const renderers = useRenderers();

  return (
    <button
      disabled={numFacts === 0}
      className={`rounded-md px-4 py-2 text-sm font-medium text-text-inverse focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 ${
        numFacts === 0
          ? "bg-button-disabled-bg cursor-not-allowed"
          : "bg-primary hover:bg-primary-hover"
      }`}
      onClick={() => saveFiles(context.rootNode, renderers)}
    >
      Save ({numFacts})
    </button>
  );
}
