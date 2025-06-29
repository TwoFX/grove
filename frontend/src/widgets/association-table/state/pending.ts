import { FactSummary } from "@/lib/fact/summary";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import {
  AssociationTableFact,
  AssociationTableState,
} from "@/lib/transfer/project";
import { useContext } from "react";

export function usePendingAssociationTableFact(): (
  widgetId: string,
  factId: string,
) => AssociationTableFact | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingAssociationTableFacts,
  );

  return (widgetId, factId) => {
    const result =
      pendingFact[widgetId]?.[factId] ??
      groveContextData.associationTableFact.byId[widgetId]?.[factId];
    return result;
  };
}

export function useCountPendingAssociationTableFacts(): number {
  return useGroveStore(
    (state) => Object.keys(state.pendingAssociationTableFacts).length,
  );
}

export function usePendingAssociationTableState(): (
  widgetId: string,
) => AssociationTableState | undefined {
  const groveContextData = useContext(GroveContext);
  const pendingState = useGroveStore(
    (state) => state.pendingAssociationTableStates,
  );

  return (widgetId) =>
    pendingState[widgetId] ??
    groveContextData.associationTableState.byId[widgetId];
}

export function useCountPendingAssociationTableStates(): number {
  return useGroveStore(
    (state) => Object.keys(state.pendingAssociationTableStates).length,
  );
}

export function computeAssociationTableFactSummary(
  fact: AssociationTableFact,
): FactSummary {
  return {
    widgetId: fact.widgetId,
    factId: fact.factId,
    href: "",
    summary: "Summary",
    metadata: fact.metadata,
    validationResult: fact.validationResult,
  };
}

export function useAssociationTableFactSummaries(): FactSummary[] {
  const groveContextData = useContext(GroveContext);
  const pendingFact = useGroveStore(
    (state) => state.pendingAssociationTableFacts,
  );

  return groveContextData.associationTableFact.all
    .map((fact) => {
      return pendingFact[fact.widgetId]?.[fact.factId] ?? fact;
    })
    .map(computeAssociationTableFactSummary);
}
