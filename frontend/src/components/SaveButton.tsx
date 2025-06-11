"use client";

import { saveFiles, useRenderers } from "@/lib/save/save";
import { useGroveStore } from "@/lib/state/state";
import { TemplateStrings } from "@/lib/templates";
import { setupTemplates } from "@/lib/templates/client";
import { Node } from "@/lib/transfer";
import { ProjectMetadata } from "@/lib/transfer/metadata";
import { JSX } from "react";

export function SaveButton({
  rootNode,
  projectMetadata,
  templateStrings,
}: {
  rootNode: Node;
  projectMetadata: ProjectMetadata;
  templateStrings: TemplateStrings;
}): JSX.Element {
  // TODO
  const pendingShowDeclarationFacts = useGroveStore(
    (state) => state.pendingShowDeclarationFacts,
  );
  const numFacts = Object.keys(pendingShowDeclarationFacts).length;

  const templates = setupTemplates(templateStrings);
  const renderers = useRenderers(projectMetadata, templates);

  return (
    <button
      disabled={numFacts === 0}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        numFacts === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      onClick={() => saveFiles(rootNode, renderers)}
    >
      Save ({numFacts})
    </button>
  );
}
