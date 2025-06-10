"use client";

import { useGroveStore } from "@/state/state";
import { TemplateStrings } from "@/templates";
import { setupTemplates } from "@/templates/client";
import { ShowDeclaration, Node } from "@/transfer";
import { JSX } from "react";

export function SaveButton({
  rootNode,
  templateStrings,
}: {
  rootNode: Node;
  templateStrings: TemplateStrings;
}): JSX.Element {
  const pendingShowDeclarationFacts = useGroveStore(
    (state) => state.pendingShowDeclarationFacts,
  );

  const numFacts = Object.keys(pendingShowDeclarationFacts).length;

  async function saveFiles() {
    const dirHandle = await window.showDirectoryPicker();

    const generatedDirHandle = await dirHandle.getDirectoryHandle("Generated", {
      create: true,
    });

    const templates = setupTemplates(templateStrings);

    async function writeShowDeclaration(
      dirHandle: FileSystemDirectoryHandle,
      decl: ShowDeclaration,
    ) {
      const fileHandle = await dirHandle.getFileHandle(decl.id + ".lean", {
        create: true,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(templates.showDeclaration(decl));
      await writable.close();
    }

    async function traverse(dirHandle: FileSystemDirectoryHandle, node: Node) {
      switch (node.constructor) {
        case "assertion":
          return;
        case "namespace":
          return;
        case "section":
          await Promise.all(
            node.section.children.map((child) => traverse(dirHandle, child)),
          );
          return;
        case "showDeclaration":
          await writeShowDeclaration(dirHandle, node.showDeclaration);
          return;
        case "text":
          return;
      }
    }

    traverse(generatedDirHandle, rootNode);
  }

  return (
    <button
      disabled={numFacts === 0}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        numFacts === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      onClick={() => saveFiles()}
    >
      Save ({numFacts})
    </button>
  );
}
