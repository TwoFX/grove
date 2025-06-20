"use client";

import { saveFiles, useRenderers } from "@/lib/save/save";
import { useCountPendingChanges } from "@/lib/state/pending";
import { JSX, useContext } from "react";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";

export function SaveButton(): JSX.Element {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const numFacts = useCountPendingChanges();

  const renderers = useRenderers(context.projectMetadata, templates);

  return (
    <button
      disabled={numFacts === 0}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        numFacts === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      onClick={() => saveFiles(context.rootNode, renderers)}
    >
      Save ({numFacts})
    </button>
  );
}
