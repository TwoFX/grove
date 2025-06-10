"use client";

import { useGroveStore } from "@/state/state";
import { Templates } from "@/templates";
import { Node, ShowDeclaration } from "@/transfer";
import { compile } from "handlebars";
import { JSX } from "react";

export function SaveButton({
  rootNode,
  templates,
}: {
  rootNode: Node;
  templates: Templates;
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

    async function writeShowDeclaration(
      dirHandle: FileSystemDirectoryHandle,
      decl: ShowDeclaration,
    ) {
      const fileHandle = await dirHandle.getFileHandle(decl.id + ".lean", {
        create: true,
      });

      console.log(templates.showDeclaration);
      const showDeclaration = compile(templates.showDeclaration);

      const writable = await fileHandle.createWritable();
      await writable.write(showDeclaration(decl));
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
