"use client";

import { TemplateStrings } from "@/lib/templates";
import { Node } from "@/lib/transfer";
import { ProjectMetadata } from "@/lib/transfer/metadata";
import { JSX } from "react";
import Image from "next/image";
import { SaveButton } from "./SaveButton";
import { ClearButton } from "./ClearButton";

export function HeaderBar({
  rootNode,
  templateStrings,
  projectMetadata,
}: {
  rootNode: Node;
  templateStrings: TemplateStrings;
  projectMetadata: ProjectMetadata;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 p-2 border-b">
      <Image
        src="/lean_logo.svg"
        alt="Lean Logo"
        width={70}
        height={40}
        priority
      />
      <div className="flex gap-2">
        <ClearButton />
        <SaveButton
          rootNode={rootNode}
          templateStrings={templateStrings}
          projectMetadata={projectMetadata}
        />
      </div>
    </div>
  );
}
