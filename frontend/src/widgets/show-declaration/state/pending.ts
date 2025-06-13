import { useGroveStore } from "@/lib/state/state";
import { ShowDeclarationFact } from "@/lib/transfer/project";
import { GroveContext } from "@/lib/transfer/context";
import { useContext } from "react";
import { FactSummary } from "@/lib/fact/summary";

export function usePendingShowDeclarationFact(): (
  widgetId: string,
  key: string,
) => ShowDeclarationFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingShowDeclarationFacts,
  );

  return (widgetId, factId) =>
    pendingFact[widgetId]?.[factId] ??
    groveContextData.showDeclarationFact.byId[widgetId]?.[factId];
}

export function useCountPendingShowDeclarationFacts(): number {
  return useGroveStore(
    (state) => Object.keys(state.pendingShowDeclarationFacts).length,
  );
}

function computeSummary(fact: ShowDeclarationFact): FactSummary {
  return {
    widgetId: fact.widgetId,
    factId: fact.factId,
    href: "",
    summary: "Summary",
    metadata: fact.metadata,
    validationResult: fact.validationResult,
  };
}

export function useShowDeclarationFactSummaries(): FactSummary[] {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingShowDeclarationFacts,
  );

  return groveContextData.showDeclarationFact.all
    .map((fact) => {
      return pendingFact[fact.widgetId]?.[fact.factId] ?? fact;
    })
    .map(computeSummary);
}
