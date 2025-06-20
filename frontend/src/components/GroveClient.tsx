"use client";

import { GroveContext } from "@/lib/transfer/context";
import { JSX, ReactNode } from "react";
import { HashCheck } from "./HashCheck";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { TemplateStrings } from "@/lib/templates";
import { setupTemplates } from "@/lib/templates/client";
import { GroveTemplateContext } from "@/lib/templates/context";

export function GroveClient({
  children,
  groveContext,
  templateStrings,
}: {
  children: ReactNode;
  groveContext: GroveContextData;
  templateStrings: TemplateStrings;
}): JSX.Element {
  const templates = setupTemplates(templateStrings);
  return (
    <GroveContext value={groveContext}>
      <GroveTemplateContext value={templates}>
        <HashCheck>{children}</HashCheck>
      </GroveTemplateContext>
    </GroveContext>
  );
}
