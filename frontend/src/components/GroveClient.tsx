"use client";

import { GroveContext } from "@/lib/transfer/context";
import { JSX, ReactNode, useState } from "react";
import { HashCheck } from "./HashCheck";
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
import { Set } from "immutable";
import {
  InvalidatedFactsContext,
  InvalidatedFactSet,
  makeInvalidatedFact,
} from "@/lib/fact/invalidated/context";
import { useFetchGroveContextData } from "@/lib/transfer/client";

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
  haveUpstreamInvalidatedFacts,
  templateStrings,
}: {
  children: ReactNode;
  haveUpstreamInvalidatedFacts: boolean;
  templateStrings: TemplateStrings;
}): JSX.Element {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>({
    id: "",
    title: "",
  });
  const { data, isLoading } = useFetchGroveContextData(
    haveUpstreamInvalidatedFacts,
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    throw new Error("Received invalid data");
  }

  const breadcrumbState: BreadcrumbState = {
    breadcrumb,
    setBreadcrumb,
  };

  const invalidatedFactSet: InvalidatedFactSet = {
    upstreamInvalidatedFacts: data.upstreamInvalidatedFacts
      ? Set(data.upstreamInvalidatedFacts.map(makeInvalidatedFact))
      : undefined,
  };

  const templates = setupTemplates(templateStrings);
  return (
    <GroveContext value={data}>
      <InvalidatedFactsContext value={invalidatedFactSet}>
        <GroveTemplateContext value={templates}>
          <BreadcrumbContext value={breadcrumbState}>
            <InnerGroveClient>{children}</InnerGroveClient>
          </BreadcrumbContext>
        </GroveTemplateContext>
      </InvalidatedFactsContext>
    </GroveContext>
  );
}

// export const GroveClient = dynamic(() => Promise.resolve(GroveClientX), {
//   ssr: false,
// });
