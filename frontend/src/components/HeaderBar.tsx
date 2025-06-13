"use client";

import { TemplateStrings } from "@/lib/templates";
import { JSX, useContext } from "react";
import Image from "next/image";
import { SaveButton } from "./SaveButton";
import { ClearButton } from "./ClearButton";
import { GroveContext } from "@/lib/transfer/context";

export function HeaderBar({
  templateStrings,
}: {
  templateStrings: TemplateStrings;
}): JSX.Element {
  const context = useContext(GroveContext);

  return (
    <div className="flex items-center justify-between gap-4 p-2 border-b">
      <div className="flex gap-4">
        <Image
          src="/lean_logo.svg"
          alt="Lean Logo"
          width={70}
          height={40}
          priority
        />
        <span className="text-2xl flex items-center">Grove</span>
        <span className="flex items-center">
          There are {context.upstreamInvalidatedFacts?.invalidatedFacts.length}{" "}
          old invalidated facts.
        </span>
      </div>
      <div className="flex gap-2">
        <ClearButton />
        <SaveButton templateStrings={templateStrings} />
      </div>
    </div>
  );
}
