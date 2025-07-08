import { FactSummary } from "@/lib/fact/summary";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { TableFact, TableState } from "@/lib/transfer/project";
import { useContext } from "react";

export function usePendingTableFact(): (
  widgetId: string,
  factId: string,
) => TableFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore((state) => state.pendingTableFacts);

  return (widgetId, factId) => {
    const result =
      pendingFact[widgetId]?.[factId] ??
      groveContextData.tableFact.byId[widgetId]?.[factId];
    return result;
  };
}

export function useCountPendingTableFacts(): number {
  return useGroveStore((state) =>
    Object.values(state.pendingTableFacts).reduce(
      (sofar, entry) => sofar + Object.keys(entry).length,
      0,
    ),
  );
}

export function usePendingTableState(): (
  widgetId: string,
) => TableState | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingState = useGroveStore((state) => state.pendingTableStates);

  return (widgetId) =>
    pendingState[widgetId] ?? groveContextData.tableState.byId[widgetId];
}

export function useCountPendingTableStates(): number {
  return useGroveStore((state) => Object.keys(state.pendingTableStates).length);
}

export function computeTableFactSummary(fact: TableFact): FactSummary {
  return {
    widgetId: fact.widgetId,
    factId: fact.factId,
    href: "",
    summary: "Summary",
    metadata: fact.metadata,
    validationResult: fact.validationResult,
  };
}

export function useTableFactSummaries(): FactSummary[] {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore((state) => state.pendingTableFacts);

  return groveContextData.tableFact.all
    .map((fact) => {
      return pendingFact[fact.widgetId]?.[fact.factId] ?? fact;
    })
    .map(computeTableFactSummary);
}
