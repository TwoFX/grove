import { FactSummary } from "@/lib/fact/summary";
import { PendingChange } from "@/lib/state/pendingchange";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { AssertionFact } from "@/lib/transfer/project";
import { useContext } from "react";

export function usePendingAssertionFact(): (
  widgetId: string,
  factId: string,
) => AssertionFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore((state) => state.pendingAssertionFacts);
  return (widgetId, factId) =>
    pendingFact[widgetId]?.[factId] ??
    groveContextData.assertionFact.byId[widgetId]?.[factId];
}

export function useCountPendingAssertionFacts(): number {
  return useGroveStore((state) =>
    Object.values(state.pendingAssertionFacts).reduce(
      (sofar, entry) => sofar + Object.keys(entry).length,
      0,
    ),
  );
}

export function computeAssertionFactSummary(
  context: GroveContextData,
  fact: AssertionFact,
): FactSummary {
  const definition = context.assertionDefinition.byId[fact.widgetId];
  return {
    widgetTitle: definition.title,
    widgetId: fact.widgetId,
    factId: fact.factId,
    href: `/assertion/${fact.widgetId}`,
    summary:
      definition.results.find((r) => r.assertionId === fact.assertionId)
        ?.description ?? "Unknown",
    metadata: fact.metadata,
    validationResult: fact.validationResult,
  };
}

export function useAssertionFactSummaries(): FactSummary[] {
  const groveContextData = useContext(GroveContext);
  const pendingFact = usePendingAssertionFact();

  return groveContextData.assertionFact.all.map((fact) => {
    const f = pendingFact(fact.widgetId, fact.factId) ?? fact;
    return computeAssertionFactSummary(groveContextData, f);
  });
}

export function usePendingAssertionChanges(): PendingChange[] {
  const context = useContext(GroveContext);
  const pendingFacts = useGroveStore((state) => state.pendingAssertionFacts);

  return Object.entries(pendingFacts).flatMap(
    ([widgetId, pendingForWidget]) => {
      const count = Object.keys(pendingForWidget).length;
      if (count === 0) {
        return [];
      } else {
        const title =
          context.assertionDefinition.byId[widgetId]?.title ??
          "Unknown assertion widget";
        return [
          {
            displayShort: `${title}: ${count} facts`,
            href: `/assertion/${widgetId}`,
            remove: (state) => {
              state.clearPendingAssertionFacts(widgetId);
            },
            id: `${widgetId}-facts`,
          },
        ];
      }
    },
  );
}
