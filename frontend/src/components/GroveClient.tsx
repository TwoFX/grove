"use client";

import { GroveContext } from "@/lib/transfer/context";
import { JSX, ReactNode, useState } from "react";
import { HashCheck } from "./HashCheck";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { TemplateStrings } from "@/lib/templates";
import { setupTemplates } from "@/lib/templates/client";
import { GroveTemplateContext } from "@/lib/templates/context";
import {
  BreadcrumbContext,
  BreadcrumbData,
  BreadcrumbState,
} from "@/lib/navigate/breadcrumb";
import {
  FactCountContext,
  useComputeFactCounts,
} from "@/lib/navigate/factcount";

function InnerGroveClient({ children }: { children: ReactNode }): JSX.Element {
  // Requires GroveContext
  const invalidatedFactCounts = useComputeFactCounts();

  return (
    <FactCountContext value={invalidatedFactCounts}>
      <HashCheck>{children}</HashCheck>
    </FactCountContext>
  );
}

export function GroveClient({
  children,
  groveContext,
  templateStrings,
}: {
  children: ReactNode;
  groveContext: GroveContextData;
  templateStrings: TemplateStrings;
}): JSX.Element {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>({
    id: "",
    title: "",
  });

  const breadcrumbState: BreadcrumbState = {
    breadcrumb,
    setBreadcrumb,
  };

  const templates = setupTemplates(templateStrings);
  return (
    <GroveContext value={groveContext}>
      <GroveTemplateContext value={templates}>
        <BreadcrumbContext value={breadcrumbState}>
          <InnerGroveClient>{children}</InnerGroveClient>
        </BreadcrumbContext>
      </GroveTemplateContext>
    </GroveContext>
  );
}
